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

/**
 * @swagger
 * /api/payments/paypal:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Pay with PayPal
 *     tags: [Payments]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PayWithPaypalDto'
 *     responses:
 *       200:
 *         description: Pay with Paypal successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
paymentRouters.post(
  "/paypal",
  AuthMiddleware,
  paymentController.payWithPayPalController
);

paymentRouters.get(
  "/paypal/success",
  paymentController.successPayPalController
);

paymentRouters.get("/paypal/cancel", paymentController.cancelPayPalController);

module.exports = paymentRouters;
