require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 8080;

connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => console.log("Server running on", PORT));
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
