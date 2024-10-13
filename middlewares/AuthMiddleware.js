const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const getLogger = require("../utils/logger");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const logger = getLogger("AUTH_MIDDLEWARE");

const AuthMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;
  logger.info("Authorization Header: " + authorization);

  const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (!authorization) {
    return res
      .status(StatusCodeEnums.Unauthorized_401)
      .json({ message: "Authorization token required" });
  }

  const token = authorization.split(" ")[1];

  try {
    const { _id, ip } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    logger.info(`User ID from token: ${_id}`);
    logger.info(`IP Address from token: ${ip}`);

    if (ip && ip !== ipAddress) {
      return res.status(StatusCodeEnums.Unauthorized_401).json({
        message: "IP address mismatch. Please log in again.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res
        .status(StatusCodeEnums.Unauthorized_401)
        .json({ message: "Invalid token" });
    }
    req.userId = _id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(StatusCodeEnums.Unauthorized_401).json({
        error: "Token expired. Please log in again.",
        errorType: "TokenExpiredError",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(StatusCodeEnums.Unauthorized_401).json({
        error: "Invalid token. Request is not authorized.",
        errorType: "JsonWebTokenError",
      });
    }
    res
      .status(StatusCodeEnums.InternalServerError_500)
      .json({ error: error.message, errorType: "Other" });
  }
};

module.exports = AuthMiddleware;
