const mongoose = require("mongoose");
const Post = require("../models/Post");
const Tier = require("../models/Tier");
const Campaign = require("../models/Campaign");
const User = require("../models/User");
const { canUserViewPost } = require("../utils/postAccess");

// CREATE post (creator only)
async function createPost(req, res) {
  const creatorId = req.user.userId;
  const { title, body, minTierName, campaignId, isLockedUntilSuccess } =
    req.body;

  if (!title || !body || !minTierName) {
    return res
      .status(400)
      .json({ message: "title, body, minTierName are required" });
  }

  // проверим, что tier существует у этого creator'а
  const tier = await Tier.findOne({ creatorId, name: minTierName });
  if (!tier)
    return res
      .status(400)
      .json({ message: "minTierName does not exist for this creator" });

  // если указали campaignId — проверим что кампания принадлежит creator'у
  if (campaignId) {
    const c = await Campaign.findOne({ _id: campaignId, creatorId });
    if (!c)
      return res
        .status(400)
        .json({ message: "campaignId not found or not your campaign" });
  }

  const imageFiles = req.files && req.files.images ? req.files.images : [];
  const videoFiles = req.files && req.files.videos ? req.files.videos : [];

  // 1) создаём пост без медиа
  const post = await Post.create({
    creatorId,
    title,
    body,
    minTierName,
    campaignId: campaignId || null,
    isLockedUntilSuccess: !!isLockedUntilSuccess,
    images: [],
    videos: [],
  });

  // 2) формируем защищённые ссылки
  const images = imageFiles.map((f) => `/media/${post._id}/${f.filename}`);
  const videos = videoFiles.map((f) => `/media/${post._id}/${f.filename}`);

  // 3) обновляем пост: $set
  const updated = await Post.findByIdAndUpdate(
    post._id,
    { $set: { images, videos } },
    { new: true },
  );

  return res.status(201).json(updated);
}

// UPDATE post (creator only)
async function updatePost(req, res) {
  const creatorId = req.user.userId;

  // если меняют minTierName — проверим что такой tier есть
  if (req.body.minTierName) {
    const tier = await Tier.findOne({ creatorId, name: req.body.minTierName });
    if (!tier)
      return res
        .status(400)
        .json({ message: "minTierName does not exist for this creator" });
  }

  // если меняют campaignId — проверим ownership
  if (req.body.campaignId) {
    const c = await Campaign.findOne({ _id: req.body.campaignId, creatorId });
    if (!c)
      return res
        .status(400)
        .json({ message: "campaignId not found or not your campaign" });
  }

  const post = await Post.findOneAndUpdate(
    { _id: req.params.postId, creatorId },
    { $set: req.body }, // advanced update
    { new: true },
  );

  if (!post)
    return res.status(404).json({ message: "Post not found or forbidden" });
  res.json(post);
}

/**
 * GET posts for creator with access check
 * - if not logged in: return only "public preview" (locked)
 * - if logged in: return full body only if user has access
 */
async function getCreatorPosts(req, res) {
  const creatorId = req.params.creatorId;

  // creator свои посты всегда видит
  if (req.user && req.user.userId === String(creatorId)) {
    const posts = await Post.find({ creatorId }).sort({ createdAt: -1 }).lean();
    return res.json(posts);
  }

  // 1) получаем посты
  const posts = await Post.find({ creatorId }).sort({ createdAt: -1 }).lean();

  // если не залогинен — показываем только превью
  if (!req.user) {
    const preview = posts.map((p) => ({
      ...p,
      body: "[Locked] Please login and subscribe to view this post",
    }));
    return res.json(preview);
  }

  const userId = req.user.userId;

  // 2) найдём пользователя и его активные подписки на этого creator'а (embedded)
  const user = await User.findById(userId).lean();
  if (!user) return res.status(401).json({ message: "User not found" });

  const activeSubs = (user.subscriptions || []).filter(
    (s) => String(s.creatorId) === String(creatorId) && s.active === true,
  );

  // если вообще нет подписки — всё будет locked
  if (activeSubs.length === 0) {
    const locked = posts.map((p) => ({
      ...p,
      body: "[Locked] Subscribe to view this post",
    }));
    return res.json(locked);
  }

  // 3) загрузим tiers creator'а чтобы сравнить уровни по price
  const tiers = await Tier.find({ creatorId }).lean();
  const priceByName = new Map(tiers.map((t) => [t.name, t.price]));

  // цена максимального тира пользователя (на который он подписан)
  const userMaxPrice = Math.max(
    ...activeSubs.map((s) => priceByName.get(s.tierName) || 0),
  );

  // 4) подготовим ответ, проверяя доступ для каждого поста
  const result = [];
  for (const p of posts) {
    const allowed = await canUserViewPost({
      userId,
      creatorId,
      post: p,
    });

    result.push({
      ...p,
      body: allowed
        ? p.body
        : "[Locked] Not enough tier or campaign not successful",
    });
  }

  return res.json(result);
}

async function getPostById(req, res) {
  const post = await Post.findById(req.params.postId).lean();
  if (!post) return res.status(404).json({ message: "Post not found" });

  // creator always can
  if (req.user && req.user.userId === String(post.creatorId))
    return res.json(post);

  // guest => locked
  if (!req.user) {
    return res.json({ ...post, body: "[Locked] Please login and subscribe" });
  }

  const allowed = await canUserViewPost({
    userId: req.user.userId,
    creatorId: post.creatorId,
    post,
  });

  return res.json({
    ...post,
    body: allowed
      ? post.body
      : "[Locked] Not enough tier or campaign not successful",
  });
}

async function deletePost(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  if (String(post.creatorId) !== String(req.user.userId)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await Post.deleteOne({ _id: post._id });
  res.json({ message: "Post deleted" });
}

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getCreatorPosts,
  getPostById,
};
