const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const AuthMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;
  console.log("Authorization Header:", authorization);

  const ipAddress = req.ip || req.socket.remoteAddress;
  console.log("User IP Address:", ipAddress);

  if (!authorization) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  const token = authorization.split(" ")[1];

  try {
    const { _id, ip } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("User ID from token:", _id);
    console.log("User IP from token:", ip);

    if (ip && ip !== ipAddress) {
      return res
        .status(401)
        .json({
          message: "IP address mismatch. Please log in again.",
        });
    }

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.userId = _id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired. Please log in again.",
        errorType: "TokenExpiredError",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid token. Request is not authorized.",
        errorType: "JsonWebTokenError",
      });
    }
    res.status(500).json({ error: error.message, errorType: "Other" });
  }
};

module.exports = AuthMiddleware;