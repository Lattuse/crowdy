const express = require("express");
const { auth, requireRole } = require("../middleware/auth");
const {
  createCampaign,
  listCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  finishCampaign,
} = require("../controllers/campaign.controller");

const router = express.Router();

router.get("/", listCampaigns);
router.get("/:id", getCampaign);

router.post("/", auth, requireRole("creator"), createCampaign);
router.patch("/:id", auth, requireRole("creator"), updateCampaign);
router.delete("/:id", auth, requireRole("creator"), deleteCampaign);

// finish campaign (creator only)
router.post("/:id/finish", auth, requireRole("creator"), finishCampaign);

module.exports = router;
