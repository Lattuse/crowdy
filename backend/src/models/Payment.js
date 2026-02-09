const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    amount: { type: Number, required: true, min: 1 },
    paymentDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["held", "released", "refunded"],
      default: "held",
    },
  },
  { timestamps: true },
);

PaymentSchema.index({ campaignId: 1, status: 1 });
PaymentSchema.index({ subscriptionId: 1 });

module.exports = mongoose.model("Payment", PaymentSchema);
