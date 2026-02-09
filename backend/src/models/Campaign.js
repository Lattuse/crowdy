const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    targetAmount: { type: Number, required: true, min: 1 },
    currentAmount: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "successful", "failed"],
      default: "active",
    },
  },
  { timestamps: true },
);

CampaignSchema.index({ creatorId: 1, status: 1 });

module.exports = mongoose.model("Campaign", CampaignSchema);
