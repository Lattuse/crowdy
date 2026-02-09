const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const tierRoutes = require("./routes/tier.routes");
const campaignRoutes = require("./routes/campaign.routes");
const postRoutes = require("./routes/post.routes");
const subscriptionRoutes = require("./routes/subscription.routes");
const creatorRoutes = require("./routes/creator.routes");
const mediaRoutes = require("./routes/media.routes");

console.log("authRoutes", typeof authRoutes);
console.log("userRoutes", typeof userRoutes);
console.log("tierRoutes", typeof tierRoutes);
console.log("campaignRoutes", typeof campaignRoutes);
console.log("postRoutes", typeof postRoutes);
console.log("subscriptionRoutes", typeof subscriptionRoutes);
console.log("creatorRoutes", typeof creatorRoutes);

const app = express();
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));
//app.use("/uploads", express.static("uploads"));
app.use("/api/v1/media", mediaRoutes);

app.get("/api/v1/health", (req, res) => res.json({ ok: true }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tiers", tierRoutes);
app.use("/api/v1/campaigns", campaignRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/creators", creatorRoutes);

module.exports = app;
