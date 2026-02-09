const Tier = require("../models/Tier");
const Campaign = require("../models/Campaign");
const User = require("../models/User");

/**
 * Правила доступа:
 * - creator всегда видит свой пост
 * - иначе пользователь должен иметь активную подписку на creator
 * - tier должен быть >= minTierName (по цене)
 * - если пост lockedUntilSuccess: campaign должен быть successful
 */
async function canUserViewPost({ userId, creatorId, post }) {
  // 1) creator всегда может
  if (String(userId) === String(creatorId)) return true;

  // 2) у пользователя должна быть активная подписка на этого creator (embedded)
  const user = await User.findById(userId).lean();
  if (!user) return false;

  const activeSubs = (user.subscriptions || []).filter(
    (s) => String(s.creatorId) === String(creatorId) && s.active === true,
  );
  if (activeSubs.length === 0) return false;

  // 3) tier access: сравниваем цены
  const tiers = await Tier.find({ creatorId }).lean();
  const priceByName = new Map(tiers.map((t) => [t.name, t.price]));

  const requiredPrice = priceByName.get(post.minTierName);
  if (requiredPrice == null) return false;

  const userMaxPrice = Math.max(
    ...activeSubs.map((s) => priceByName.get(s.tierName) || 0),
  );
  if (userMaxPrice < requiredPrice) return false;

  // 4) campaign success check
  if (post.isLockedUntilSuccess && post.campaignId) {
    const campaign = await Campaign.findById(post.campaignId).lean();
    if (!campaign || campaign.status !== "successful") return false;
  }

  return true;
}

module.exports = { canUserViewPost };
