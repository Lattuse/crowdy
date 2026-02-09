const express = require("express");
const { body } = require("express-validator");
const { register, login } = require("../controllers/auth.controller");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").isString().isLength({ min: 2 }).withMessage("Name too short"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isString()
      .isLength({ min: 6 })
      .withMessage("Password min 6 chars"),
  ],
  register,
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isString()
      .isLength({ min: 1 })
      .withMessage("Password required"),
  ],
  login,
);

module.exports = router;
