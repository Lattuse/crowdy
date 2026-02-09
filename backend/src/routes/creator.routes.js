const express = require("express");
const { auth, requireRole } = require("../middleware/auth");
const { creatorDashboard } = require("../controllers/creator.controller");

const router = express.Router();

router.get(
  "/:creatorId/dashboard",
  auth,
  requireRole("creator"),
  creatorDashboard,
);

module.exports = router;
