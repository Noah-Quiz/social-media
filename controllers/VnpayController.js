const DatabaseTransaction = require("../repositories/DatabaseTransaction.js");
const config = require("../vnpay/vnpay.config.js");
const moment = require("moment");
const crypto = require("crypto");
const querystring = require("qs");

// Utility function to sort object keys
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
  });
  return sorted;
}

// Function to create payment URL
exports.createPaymentUrl = (req, res) => {
  const date = new Date();
  const createDate = moment(date).format("YYYYMMDDHHmmss");
  const orderId = moment(date).format("DDHHmmss");
  const { amount, bankCode } = req.body;
  const userId = req.userId;
  if (!amount) {
    return res.status(400).json({
      message: "Please fill in the required fields: amount",
    });
  }

  const ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const ReturnInfo = `${userId},${amount}`;
  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: config.vnp_TmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: ReturnInfo,
    vnp_OrderType: "other",
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: config.vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  if (bankCode) {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);
  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", config.vnp_HashSecret);
  vnp_Params["vnp_SecureHash"] = hmac
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  const vnpUrl = `${config.vnp_Url}?${querystring.stringify(vnp_Params, {
    encode: false,
  })}`;
  res.status(200).json({ url: vnpUrl });
};

// VNPay return URL handler
exports.vnpayReturn = async (req, res) => {
  let vnp_Params = req.query;
  const secureHash = vnp_Params["vnp_SecureHash"];
  // Remove secureHash params before processing
  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];
  // Sort the parameters to compare with the signature
  vnp_Params = sortObject(vnp_Params);
  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", config.vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  // Validate the checksum and payment status
  if (secureHash === signed && vnp_Params["vnp_ResponseCode"] === "00") {
    const orderInfo = vnp_Params.vnp_OrderInfo.trim();
    // Slice the first 24 characters as userId, the rest as amount
    const userId = orderInfo.slice(0, 24);
    const amount = parseFloat(orderInfo.slice(27).trim());
    try {
      const connection = new DatabaseTransaction();
      const result = await connection.userRepository.topUpUserBalance(
        userId,
        amount
      ); //1VND = 1 balance
      const receipt =
        await connection.receiptRepository.createReceiptRepository(
          userId,
          (paymentMethod = "Online Payment"),
          (paymentPort = "VNPAY"),
          (bankCode = vnp_Params.vnp_BankCode),
          amount,
          (transactionId = vnp_Params.vnp_TxnRef)
        );
      if (!receipt) {
        return res.status(400).json({ message: "Failed to create receipt" });
      } else {
        console.log("receipt generated");
      }
      console.log(
        `Top-up successful for User ID: ${userId}, Amount: ${amount} VND`
      );
      res.status(200).json({
        success: true,
        message: "Payment successful",
        vnp_Params: vnp_Params,
      });
    } catch (error) {
      console.error(
        `Error updating wallet balance for User ID: ${userId} - ${error.message}`
      );
      res.status(500).json({
        success: false,
        message:
          "Payment successful, but failed to update user balance, please contact admin for suports",
        error: error.message,
      });
    }
  } else {
    res.status(400).json({
      success: false,
      message: "Payment failed or checksum validation failed",
      vnp_Params: vnp_Params,
    });
  }
};
