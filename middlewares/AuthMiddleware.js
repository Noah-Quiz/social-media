const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const getLogger = require("../utils/logger");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const logger = getLogger("AUTH_MIDDLEWARE");
const { match } = require("path-to-regexp");
const publicRoutes = require("../routes/PublicRoute");
require("dotenv").config();

const isUnprotectedRoute = (path, method) => {
  const pathname = path.split("?")[0];
  logger.info(
    `Checking if route is unprotected: ${pathname}, method: ${method}`
  );

  const matchedRoute = publicRoutes.find((route) => {
    const matchFn = match(route.path, { decode: decodeURIComponent });
    const matched = matchFn(pathname);
    return matched && route.method === method && matched.path === pathname;
  });

  if (matchedRoute) {
    logger.info(`Matched route: ${matchedRoute.path}`);
    // Additional validation for dynamic parameters
    const matchFn = match(matchedRoute.path, { decode: decodeURIComponent });
    const matchedParams = matchFn(pathname)?.params;

    if (matchedParams) {
      // Iterate over all parameters and validate if they end with 'Id'
      for (const [key, value] of Object.entries(matchedParams)) {
        if (key.endsWith("Id")) {
          if (!/^[0-9a-fA-F]{24}$/.test(value)) {
            // MongoDB ObjectId format validation
            logger.info(`Invalid ${key} parameter: ${value}`);
            return false; // Reject invalid parameter matches
          }
        }
      }
    }

    logger.info(
      `Matched route: ${
        matchedRoute.path
      }, matched parameters: ${JSON.stringify(matchedParams)}`
    );
    return true;
  }
  return false;
};

const AuthMiddleware = async (req, res, next) => {
  // Append requester ID to req for other purposes
  const isUnprotected = isUnprotectedRoute(req.originalUrl, req.method);
  logger.info("Is unprotected route: " + isUnprotected);
  if (isUnprotected) {
    logger.info("Handling unprotected route");
    const { authorization } = req.headers;

    if (authorization) {
      try {
        const token = authorization.split(" ")[1];
        const { _id, ip } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (mongoose.Types.ObjectId.isValid(_id)) {
          req.requesterId = _id;
          logger.info(`Valid token for User ID: ${_id}, IP from token: ${ip}`);
        } else {
          logger.warn("Invalid user ID in token.");
        }
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          logger.warn("Token expired.");
        } else if (error.name === "JsonWebTokenError") {
          logger.warn("Invalid token.");
        } else {
          logger.error(`Token verification error: ${error.message}`);
        }
      }
    }

    return next();
  }

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

    // if (ip && ip !== ipAddress) {
    //   return res.status(StatusCodeEnums.Unauthorized_401).json({
    //     message: "IP address mismatch. Please log in again.",
    //   });
    // }

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
