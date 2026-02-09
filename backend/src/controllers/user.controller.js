const mongoose = require("mongoose");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

async function me(req, res) {
  const user = await User.findById(req.user.userId).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
}

function signToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

async function becomeCreator(req, res) {
  const userId = req.user.userId;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { role: "creator" } },
    { new: true },
  );

  const token = signToken(user);

  res.json({
    message: "Role updated",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
}

// GET /api/v1/users/:id
async function getUserById(req, res) {
  const { id } = req.params;

  // 1) проверка на валидный ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  // 2) ищем пользователя
  const user = await User.findById(id).select("_id name role").lean();

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // 3) возвращаем публичный профиль
  res.json(user);
}

module.exports = { me, becomeCreator, getUserById };
