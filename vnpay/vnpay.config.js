const result = require("dotenv").config();
if (result.error) {
  console.error("Error loading .env file:", result.error);
} else {
  console.log("Vnpay environment variables loaded successfully.");
}

module.exports = {
  vnp_TmnCode: process.env.VNP_TMNCODE,
  vnp_HashSecret: process.env.VNP_HASHSECRET,
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
  vnp_ReturnUrl: "http://localhost:4000/api/vnpay/vnpay_return",
};
