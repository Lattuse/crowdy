const mongoose = require("mongoose");

const TierSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 1 },
    perks: { type: [String], default: [] },
  },
  { timestamps: true },
);

TierSchema.index({ creatorId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Tier", TierSchema);
