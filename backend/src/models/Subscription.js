const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    tierName: { type: String, required: true },
    type: { type: String, enum: ["regular", "crowdfunding"], required: true },

    status: {
      type: String,
      enum: ["pending", "active", "paused", "cancelled", "refunded"],
      default: "active",
    },

    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null }, // для regular обязательно будет
    remainingMs: { type: Number, default: null }, // для paused
    resumeAt: { type: Date, default: null }, // когда разморозить
  },
  { timestamps: true },
);

SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ creatorId: 1, userId: 1, type: 1, status: 1 }); // полезно

module.exports = mongoose.model("Subscription", SubscriptionSchema);
