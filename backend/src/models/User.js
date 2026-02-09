const mongoose = require("mongoose");

const EmbeddedSubscriptionSchema = new mongoose.Schema(
  {
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    tierName: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { _id: false },
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "creator"], default: "user" },
    subscriptions: { type: [EmbeddedSubscriptionSchema], default: [] },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ name: 1 });

module.exports = mongoose.model("User", UserSchema);
