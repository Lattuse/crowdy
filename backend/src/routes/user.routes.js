const express = require("express");
const { auth } = require("../middleware/auth");
const { me, becomeCreator } = require("../controllers/user.controller");
const { searchUsers } = require("../controllers/userSearch.controller");
const { getUserById } = require("../controllers/user.controller");

const router = express.Router();

router.get("/me", auth, me);
router.patch("/me/role", auth, becomeCreator);
router.get("/search", searchUsers);
router.get("/:id", getUserById);

module.exports = router;
