const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    // доступ по tier
    minTierName: { type: String, required: true },

    // если пост “после успешного кампейна”
    campaignId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isLockedUntilSuccess: { type: Boolean, default: false },
  },
  { timestamps: true },
);

PostSchema.index({ creatorId: 1, createdAt: -1 });

module.exports = mongoose.model("Post", PostSchema);
