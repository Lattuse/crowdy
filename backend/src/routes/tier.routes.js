const express = require("express");
const { auth, requireRole } = require("../middleware/auth");
const {
  createTier,
  getCreatorTiers,
  updateTier,
  deleteTier,
} = require("../controllers/tier.controller");

const router = express.Router();

// public (view creator tiers)
router.get("/creator/:creatorId", getCreatorTiers);

// creator only
router.post("/", auth, requireRole("creator"), createTier);
router.patch("/:tierId", auth, requireRole("creator"), updateTier);
router.delete("/:tierId", auth, requireRole("creator"), deleteTier);

module.exports = router;
