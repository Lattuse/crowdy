const Tier = require("../models/Tier");

// CREATE tier (creator only)
async function createTier(req, res) {
  const { name, price, perks } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: "Name and price are required" });
  }

  const tier = await Tier.create({
    creatorId: req.user.userId,
    name,
    price,
    perks: perks || [],
  });

  res.status(201).json(tier);
}

// GET tiers of creator
async function getCreatorTiers(req, res) {
  const { creatorId } = req.params;

  const tiers = await Tier.find({ creatorId }).sort({ price: 1 });
  res.json(tiers);
}

// UPDATE tier
async function updateTier(req, res) {
  const tier = await Tier.findOneAndUpdate(
    { _id: req.params.tierId, creatorId: req.user.userId },
    { $set: req.body }, // advanced update
    { new: true },
  );

  if (!tier)
    return res.status(404).json({ message: "Tier not found or forbidden" });
  res.json(tier);
}

// DELETE tier
async function deleteTier(req, res) {
  const tier = await Tier.findOneAndDelete({
    _id: req.params.tierId,
    creatorId: req.user.userId,
  });

  if (!tier)
    return res.status(404).json({ message: "Tier not found or forbidden" });
  res.json({ message: "Tier deleted" });
}

module.exports = {
  createTier,
  getCreatorTiers,
  updateTier,
  deleteTier,
};
