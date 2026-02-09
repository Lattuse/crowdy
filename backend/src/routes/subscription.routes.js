const express = require("express");
const { auth } = require("../middleware/auth");
const {
  listMySubscriptions,
} = require("../controllers/subscription.controller");

const {
  createSubscription,
  cancelSubscription,
  refreshSubscriptions,
} = require("../controllers/subscription.controller");

const router = express.Router();

router.post("/", auth, createSubscription);
router.get("/me", auth, listMySubscriptions);
router.patch("/:id/cancel", auth, cancelSubscription);

// фронт будет вызывать при входе/открытии страниц
router.post("/refresh", auth, refreshSubscriptions);

module.exports = router;
