const result = require("dotenv").config();
const getLogger = require("../utils/logger");
const logger = getLogger("VNPAY");
if (result.error) {
  logger.error("Error loading .env file:", result.error);
} else {
  logger.info(".env file loaded successfully");
}

module.exports = {
  vnp_TmnCode: process.env.VNP_TMNCODE,
  vnp_HashSecret: process.env.VNP_HASHSECRET,
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
  vnp_ReturnUrl: "http://localhost:4000/api/vnpay/vnpay_return",
};
