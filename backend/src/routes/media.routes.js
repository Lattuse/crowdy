const router = require("express").Router();
const { auth } = require("../middleware/auth");
const Post = require("../models/Post");
const { canUserViewPost } = require("../utils/postAccess");
const { makeS3Client } = require("../utils/s3");

const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// key, not filename
router.get("/:postId/:key", auth, async (req, res) => {
  const { postId, key } = req.params;

  const post = await Post.findById(postId).lean();
  if (!post) return res.status(404).json({ message: "Post not found" });

  const allowed = await canUserViewPost({
    userId: req.user.userId,
    creatorId: post.creatorId,
    post,
  });

  if (!allowed) {
    return res.status(403).json({ message: "Media access forbidden" });
  }

  // key приходит url-encoded
  const Key = decodeURIComponent(key);

  try {
    const s3 = makeS3Client();

    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.BUCKET,
        Key,
      }),
      { expiresIn: 60 * 10 }, // 10 mins
    );

    return res.redirect(url);
  } catch (e) {
    console.error("S3 media error:", e);
    return res.status(404).json({ message: "File not found in bucket" });
  }
});

module.exports = router;
