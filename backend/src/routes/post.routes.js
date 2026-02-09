const express = require("express");
const { auth, requireRole } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const {
  createPost,
  updatePost,
  deletePost,
  getCreatorPosts,
  getPostById,
} = require("../controllers/post.controller");

const router = express.Router();

function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();

  const jwt = require("jsonwebtoken");
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {}
  next();
}

router.get("/creator/:creatorId", optionalAuth, getCreatorPosts);

router.post(
  "/",
  auth,
  requireRole("creator"),
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  createPost,
);

router.patch("/:postId", auth, requireRole("creator"), updatePost);
router.delete("/:id", auth, deletePost);
router.get("/:postId", optionalAuth, getPostById);

module.exports = router;
