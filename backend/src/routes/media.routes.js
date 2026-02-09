const express = require("express");
const path = require("path");
const fs = require("fs");
const { auth } = require("../middleware/auth");
const Post = require("../models/Post");
const { canUserViewPost } = require("../utils/postAccess");

const router = express.Router();

router.get("/:postId/:filename", auth, async (req, res) => {
  const { postId, filename } = req.params;

  const post = await Post.findById(postId).lean();
  if (!post) return res.status(404).json({ message: "Post not found" });

  const allowed = await canUserViewPost({
    userId: req.user.userId,
    creatorId: post.creatorId,
    post,
  });

  if (!allowed)
    return res.status(403).json({ message: "Media access forbidden" });

  const filePath = path.resolve("uploads", filename);
  if (!fs.existsSync(filePath))
    return res.status(404).json({ message: "File not found" });

  return res.sendFile(filePath);
});

module.exports = router;
