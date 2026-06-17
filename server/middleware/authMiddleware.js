const jwt = require("jsonwebtoken");
const { redisClient } = require("../config/redis");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // Check Redis token blacklist (set on logout)
      try {
        const isBlacklisted = await redisClient.get(`blacklist:${token}`);
        if (isBlacklisted) {
          return res.status(401).json({
            success: false,
            message: "Token has been invalidated. Please log in again.",
          });
        }
      } catch (redisErr) {
        // Redis unavailable — skip blacklist check, still verify JWT
        console.warn("Redis unavailable, skipping blacklist check:", redisErr.message);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      req.token = token; // attach token so logout controller can blacklist it

      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

module.exports = protect;