const mongoose = require("mongoose");
const Campaign = require("../models/Campaign");
const Payment = require("../models/Payment");
const Subscription = require("../models/Subscription");

// CREATE campaign (creator only)
async function createCampaign(req, res) {
  const creatorId = req.user.userId;
  const { title, description, targetAmount, startDate, endDate } = req.body;

  const campaign = await Campaign.create({
    creatorId,
    title,
    description,
    targetAmount,
    startDate,
    endDate,
  });

  res.status(201).json(campaign);
}

// GET list with filters + pagination
async function listCampaigns(req, res) {
  const {
    status = "active",
    page = 1,
    limit = 6,
    sort = "-createdAt",
  } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const campaigns = await Campaign.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Campaign.countDocuments(filter);

  res.json({
    data: campaigns,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
  });
}

// GET campaign by id
async function getCampaign(req, res) {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) return res.status(404).json({ message: "Campaign not found" });
  res.json(campaign);
}

// UPDATE campaign
async function updateCampaign(req, res) {
  const campaign = await Campaign.findOneAndUpdate(
    { _id: req.params.id, creatorId: req.user.userId },
    { $set: req.body }, // advanced update: $set
    { new: true },
  );

  if (!campaign)
    return res.status(404).json({ message: "Not found or forbidden" });
  res.json(campaign);
}

// DELETE campaign
async function deleteCampaign(req, res) {
  const campaign = await Campaign.findOneAndDelete({
    _id: req.params.id,
    creatorId: req.user.userId,
  });

  if (!campaign)
    return res.status(404).json({ message: "Not found or forbidden" });
  res.json({ message: "Campaign deleted" });
}

async function finishCampaign(req, res) {
  const creatorId = req.user.userId;
  const campaignId = req.params.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const campaign = await Campaign.findOne({
      _id: campaignId,
      creatorId,
    }).session(session);
    if (!campaign) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ message: "Campaign not found or forbidden" });
    }

    if (campaign.status !== "active") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Campaign already finished" });
    }

    const newStatus =
      campaign.currentAmount >= campaign.targetAmount ? "successful" : "failed";

    await Campaign.updateOne(
      { _id: campaignId },
      { $set: { status: newStatus } },
      { session },
    );

    if (newStatus === "successful") {
      // release held payments
      await Payment.updateMany(
        { campaignId, status: "held" },
        { $set: { status: "released" } },
        { session },
      );
    } else {
      // refund held payments
      await Payment.updateMany(
        { campaignId, status: "held" },
        { $set: { status: "refunded" } },
        { session },
      );

      // mark subscriptions refunded (optional but nice)
      await Subscription.updateMany(
        { campaignId, status: "active" },
        { $set: { status: "refunded" } },
        { session },
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({ campaignId, status: newStatus });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Server error", error: e.message });
  }
}

module.exports = {
  createCampaign,
  listCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  finishCampaign,
};
