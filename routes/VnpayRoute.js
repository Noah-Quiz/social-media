// routes/vnpay.route.js

const express = require("express");
const router = express.Router();
const vnpayController = require("../controllers/VnpayController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
router.post(
  "/create_payment_url",
  AuthMiddleware,
  vnpayController.createPaymentUrl
);
router.get("/vnpay_return", vnpayController.vnpayReturn);

module.exports = router;
