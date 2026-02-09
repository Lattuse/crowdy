const mongoose = require("mongoose");

async function connectDB(uri) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { dbName: "crowdy" });
  console.log("MongoDB connected to DB:", mongoose.connection.name);
}

module.exports = { connectDB };
