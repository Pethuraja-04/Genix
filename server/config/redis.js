const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err.message);
});

redisClient.on("connect", () => {
  console.log("Redis connected successfully");
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Redis connection failed:", err.message);
    console.error("⚠️  Server running WITHOUT Redis. Caching and token blacklist disabled.");
  }
};

module.exports = { redisClient, connectRedis };
