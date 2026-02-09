const mongoose = require("mongoose");
const Campaign = require("../models/Campaign");
const Payment = require("../models/Payment");

async function creatorDashboard(req, res) {
  const creatorId = req.params.creatorId;

  if (req.user.role !== "creator" || req.user.userId !== creatorId) {
    return res
      .status(403)
      .json({ message: "Forbidden: only creator can view own dashboard" });
  }

  const creatorObjectId = new mongoose.Types.ObjectId(creatorId);

  const campaigns = await Campaign.find({ creatorId: creatorObjectId })
    .sort({ createdAt: -1 })
    .lean();

  const campaignsWithProgress = campaigns.map((c) => ({
    ...c,
    progressPercent:
      c.targetAmount > 0
        ? Math.min(100, Math.round((c.currentAmount / c.targetAmount) * 100))
        : 0,
  }));

  // A) Campaign-based payments (crowdfunding flow)
  const campaignPaymentsAgg = await Payment.aggregate([
    {
      $lookup: {
        from: "campaigns",
        localField: "campaignId",
        foreignField: "_id",
        as: "campaign",
      },
    },
    { $unwind: "$campaign" },
    { $match: { "campaign.creatorId": creatorObjectId } },
    {
      $facet: {
        totalsByStatus: [
          {
            $group: {
              _id: "$status",
              totalAmount: { $sum: "$amount" },
              paymentsCount: { $sum: 1 },
            },
          },
          { $sort: { totalAmount: -1 } },
        ],
        byCampaign: [
          {
            $group: {
              _id: { campaignId: "$campaignId", status: "$status" },
              totalAmount: { $sum: "$amount" },
              paymentsCount: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: "$_id.campaignId",
              byStatus: {
                $push: {
                  status: "$_id.status",
                  totalAmount: "$totalAmount",
                  paymentsCount: "$paymentsCount",
                },
              },
            },
          },
        ],
        topSupporters: [
          {
            $group: {
              _id: "$userId",
              totalContributed: { $sum: "$amount" },
              paymentsCount: { $sum: 1 },
            },
          },
          { $sort: { totalContributed: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          {
            $project: {
              _id: 0,
              userId: "$_id",
              name: "$user.name",
              email: "$user.email",
              totalContributed: 1,
              paymentsCount: 1,
            },
          },
        ],
      },
    },
  ]);

  const campaignDashboard = campaignPaymentsAgg[0] || {
    totalsByStatus: [],
    byCampaign: [],
    topSupporters: [],
  };

  // B) Regular payments (campaignId = null)
  // We join payments -> subscriptions to know creatorId
  const regularPaymentsAgg = await Payment.aggregate([
    { $match: { campaignId: null } },
    {
      $lookup: {
        from: "subscriptions",
        localField: "subscriptionId",
        foreignField: "_id",
        as: "sub",
      },
    },
    { $unwind: "$sub" },
    { $match: { "sub.creatorId": creatorObjectId, "sub.type": "regular" } },
    {
      $group: {
        _id: "$status",
        totalAmount: { $sum: "$amount" },
        paymentsCount: { $sum: 1 },
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);

  res.json({
    campaigns: campaignsWithProgress,

    // crowdfunding stats
    crowdfunding: {
      totalsByStatus: campaignDashboard.totalsByStatus,
      byCampaign: campaignDashboard.byCampaign,
      topSupporters: campaignDashboard.topSupporters,
    },

    // regular stats
    regular: {
      totalsByStatus: regularPaymentsAgg,
    },
  });
}

module.exports = { creatorDashboard };
