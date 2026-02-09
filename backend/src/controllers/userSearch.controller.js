const User = require("../models/User");

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/v1/users/search?q=...&role=creator|user&page=1&limit=10
async function searchUsers(req, res) {
  const q = (req.query.q || "").trim();
  const role = (req.query.role || "").trim();
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(
    30,
    Math.max(1, parseInt(req.query.limit || "10", 10)),
  );
  const skip = (page - 1) * limit;

  if (q.length < 2) {
    return res.json({ page, limit, total: 0, data: [] });
  }

  const safe = escapeRegex(q);
  // prefix search: ^q (оптимальнее, чем просто contains)
  const nameRegex = new RegExp("^" + safe, "i");

  const filter = { name: nameRegex };
  if (role === "creator" || role === "user") filter.role = role;

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select("_id name role") // публично НЕ выдаём email
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  res.json({ page, limit, total, data: users });
}

module.exports = { searchUsers };
