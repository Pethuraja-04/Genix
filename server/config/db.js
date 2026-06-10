const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.error("⚠️  Server running WITHOUT database. API calls will fail until MongoDB is available.");
    // Do NOT exit — keep server running so you can see the error clearly
  }
};

module.exports = connectDB;
