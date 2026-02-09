const mongoose = require("mongoose");
const Subscription = require("../models/Subscription");
const Payment = require("../models/Payment");
const Campaign = require("../models/Campaign");
const Tier = require("../models/Tier");
const User = require("../models/User");

const REGULAR_DAYS = 30;
const MS_DAY = 24 * 60 * 60 * 1000;

function addDays(date, days) {
  return new Date(date.getTime() + days * MS_DAY);
}

// Вспомогательное: обновить embedded подписку пользователя так,
// чтобы по creator был только 1 активный элемент (как “активная подписка сейчас”)
async function setEmbeddedActiveSubscription({
  session,
  userId,
  creatorId,
  subscriptionId,
  tierName,
}) {
  await User.updateOne(
    { _id: userId },
    {
      $pull: { subscriptions: { creatorId } },
    },
    { session },
  );

  await User.updateOne(
    { _id: userId },
    {
      $push: {
        subscriptions: {
          subscriptionId,
          creatorId,
          tierName,
          active: true,
        },
      },
    },
    { session },
  );
}

// Удалить embedded активную подписку по creator
async function removeEmbeddedSubscription({ session, userId, creatorId }) {
  await User.updateOne(
    { _id: userId },
    { $pull: { subscriptions: { creatorId } } },
    { session },
  );
}

// REFRESH: если есть paused подписка, у которой resumeAt <= now,
// то активируем её на remainingMs
async function refreshSubscriptions(req, res) {
  const userId = req.user.userId;
  const now = new Date();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const toResume = await Subscription.find({
      userId,
      type: "regular",
      status: "paused",
      resumeAt: { $lte: now },
    }).session(session);

    const resumed = [];

    for (const sub of toResume) {
      const remainingMs = sub.remainingMs || 0;
      if (remainingMs <= 0) {
        // если вдруг 0 — просто закрываем
        await Subscription.updateOne(
          { _id: sub._id },
          { $set: { status: "cancelled", remainingMs: null, resumeAt: null } },
          { session },
        );
        continue;
      }

      const newStart = now;
      const newEnd = new Date(now.getTime() + remainingMs);

      await Subscription.updateOne(
        { _id: sub._id },
        {
          $set: {
            status: "active",
            startDate: newStart,
            endDate: newEnd,
            remainingMs: null,
            resumeAt: null,
          },
        },
        { session },
      );

      await setEmbeddedActiveSubscription({
        session,
        userId,
        creatorId: sub.creatorId,
        subscriptionId: sub._id,
        tierName: sub.tierName,
      });

      resumed.push(sub._id);
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ resumedCount: resumed.length, resumedIds: resumed });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Server error", error: e.message });
  }
}

// CREATE subscription (regular or crowdfunding)
async function createSubscription(req, res) {
  const userId = req.user.userId;
  const { creatorId, campaignId, tierName, type, amount } = req.body;

  if (!creatorId || !tierName || !type || !amount) {
    return res
      .status(400)
      .json({ message: "creatorId, tierName, type, amount are required" });
  }
  if (!["regular", "crowdfunding"].includes(type)) {
    return res
      .status(400)
      .json({ message: "type must be regular or crowdfunding" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1) tier обязателен
    const newTier = await Tier.findOne({ creatorId, name: tierName }).session(
      session,
    );
    if (!newTier) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Tier not found for this creator" });
    }
    if (Number(amount) < Number(newTier.price)) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: `Amount must be >= tier price (${newTier.price})` });
    }

    // ===== REGULAR FLOW (без campaign) =====
    if (type === "regular") {
      const now = new Date();
      const newEnd = addDays(now, REGULAR_DAYS);

      // найдем текущую active regular подписку (если есть)
      const current = await Subscription.findOne({
        userId,
        creatorId,
        type: "regular",
        status: "active",
        endDate: { $ne: null },
      }).session(session);

      if (current) {
        // сравним цены тиров (апгрейд/даунгрейд)
        const currentTier = await Tier.findOne({
          creatorId,
          name: current.tierName,
        }).session(session);
        const currentPrice = currentTier ? Number(currentTier.price) : 0;
        const newPrice = Number(newTier.price);

        // если тот же уровень — не даем создать дубликат
        if (current.tierName === tierName) {
          await session.abortTransaction();
          session.endSession();
          return res
            .status(400)
            .json({ message: "You already have this tier active" });
        }

        // если апгрейд (дороже)
        if (newPrice > currentPrice) {
          const remainingMs = Math.max(
            0,
            new Date(current.endDate).getTime() - now.getTime(),
          );

          // заморозить текущую
          await Subscription.updateOne(
            { _id: current._id },
            {
              $set: {
                status: "paused",
                remainingMs,
                resumeAt: newEnd,
              },
            },
            { session },
          );

          // убрать embedded активную (теперь активная будет новая)
          await removeEmbeddedSubscription({ session, userId, creatorId });
        } else {
          // даунгрейд (дешевле) — сделаем “в очередь”:
          // создадим новую paused, которая стартует после текущей и длится 30 дней
          const queued = await Subscription.create(
            [
              {
                userId,
                creatorId,
                campaignId: null,
                tierName,
                type: "regular",
                status: "paused",
                startDate: now,
                endDate: null,
                remainingMs: REGULAR_DAYS * MS_DAY,
                resumeAt: current.endDate,
              },
            ],
            { session },
          );

          // платеж для queued сразу released (как “оплачено”), можно и held, но проще так
          await Payment.create(
            [
              {
                userId,
                subscriptionId: queued[0]._id,
                campaignId: null,
                amount,
                status: "released",
              },
            ],
            { session },
          );

          await session.commitTransaction();
          session.endSession();

          return res.status(201).json({
            message:
              "Downgrade queued to start after current subscription ends",
            subscriptionId: queued[0]._id,
            paymentStatus: "released",
            queued: true,
          });
        }
      }

      // создать новую active regular (30 дней)
      const [sub] = await Subscription.create(
        [
          {
            userId,
            creatorId,
            campaignId: null,
            tierName,
            type: "regular",
            status: "active",
            startDate: now,
            endDate: newEnd,
          },
        ],
        { session },
      );

      // payment released сразу
      await Payment.create(
        [
          {
            userId,
            subscriptionId: sub._id,
            campaignId: null,
            amount,
            status: "released",
          },
        ],
        { session },
      );

      await setEmbeddedActiveSubscription({
        session,
        userId,
        creatorId,
        subscriptionId: sub._id,
        tierName,
      });

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        subscriptionId: sub._id,
        paymentStatus: "released",
        campaignId: null,
      });
    }

    // ===== CROWDFUNDING FLOW (campaign required) =====
    if (!campaignId) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "campaignId is required for crowdfunding" });
    }

    const campaign = await Campaign.findById(campaignId).session(session);
    if (!campaign) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Campaign not found" });
    }
    if (campaign.status !== "active") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Campaign is not active" });
    }

    const [sub] = await Subscription.create(
      [
        {
          userId,
          creatorId,
          campaignId: campaign._id,
          tierName,
          type: "crowdfunding",
          status: "active",
          startDate: new Date(),
          endDate: null,
        },
      ],
      { session },
    );

    await Payment.create(
      [
        {
          userId,
          subscriptionId: sub._id,
          campaignId: campaign._id,
          amount,
          status: "held",
        },
      ],
      { session },
    );

    await Campaign.updateOne(
      { _id: campaign._id },
      { $inc: { currentAmount: amount } },
      { session },
    );

    await setEmbeddedActiveSubscription({
      session,
      userId,
      creatorId,
      subscriptionId: sub._id,
      tierName,
    });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      subscriptionId: sub._id,
      paymentStatus: "held",
      campaignId: campaign._id,
    });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Server error", error: e.message });
  }
}

// CANCEL subscription
async function cancelSubscription(req, res) {
  const userId = req.user.userId;
  const subscriptionId = req.params.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sub = await Subscription.findOne({
      _id: subscriptionId,
      userId,
    }).session(session);
    if (!sub) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Subscription not found" });
    }
    if (sub.status !== "active") {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Only active subscription can be cancelled" });
    }

    await Subscription.updateOne(
      { _id: subscriptionId },
      { $set: { status: "cancelled" } },
      { session },
    );

    // refund only held payments
    const refundResult = await Payment.updateMany(
      { subscriptionId, status: "held" },
      { $set: { status: "refunded" } },
      { session },
    );

    // remove embedded active sub for this creator
    await removeEmbeddedSubscription({
      session,
      userId,
      creatorId: sub.creatorId,
    });

    await session.commitTransaction();
    session.endSession();

    return res.json({
      message: "Subscription cancelled",
      refundedHeldPayments: refundResult.modifiedCount || 0,
    });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Server error", error: e.message });
  }
}

async function listMySubscriptions(req, res) {
  const userId = new mongoose.Types.ObjectId(req.user.userId);

  const data = await Subscription.aggregate([
    { $match: { userId } },
    { $sort: { startDate: -1, _id: -1 } },

    // creator info
    {
      $lookup: {
        from: "users",
        localField: "creatorId",
        foreignField: "_id",
        as: "creator",
      },
    },
    { $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },

    // campaign info (optional)
    {
      $lookup: {
        from: "campaigns",
        localField: "campaignId",
        foreignField: "_id",
        as: "campaign",
      },
    },
    { $unwind: { path: "$campaign", preserveNullAndEmptyArrays: true } },

    // shape result (don’t leak emails)
    {
      $project: {
        _id: 1,
        type: 1,
        status: 1,
        tierName: 1,
        startDate: 1,
        endDate: 1,
        resumeAt: 1,
        remainingMs: 1,
        creatorId: 1,
        campaignId: 1,
        "creator._id": 1,
        "creator.name": 1,
        "creator.role": 1,
        "campaign._id": 1,
        "campaign.title": 1,
        "campaign.status": 1,
        "campaign.currentAmount": 1,
        "campaign.targetAmount": 1,
      },
    },
  ]);

  res.json({ data });
}

module.exports = {
  createSubscription,
  cancelSubscription,
  refreshSubscriptions,
  listMySubscriptions,
};
