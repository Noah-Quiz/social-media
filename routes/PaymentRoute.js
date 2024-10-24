const express = require("express");
const paymentRouters = express.Router();
require("dotenv").config();
const vnpayController = require("../controllers/VnpayController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const paypal = require("paypal-rest-sdk");
const PaymentController = require("../controllers/PaymentController");
const paymentController = new PaymentController();
paymentRouters.post("/vnpay", AuthMiddleware, vnpayController.createPaymentUrl);
paymentRouters.get("vnpay/callback", vnpayController.vnpayReturn);

paypal.configure({
  mode: "sandbox",
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET_KEY,
});

paymentRouters.get(
  "/paypal",
//   AuthMiddleware,
  paymentController.payWithPayPalController
);

paymentRouters.get(
  "/paypal/success",
  paymentController.successPayPalController
);

paymentRouters.get("/paypal/cancel", (req, res) => res.send("Cancelled"));

module.exports = paymentRouters;
