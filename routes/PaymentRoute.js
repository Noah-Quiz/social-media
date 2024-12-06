const express = require("express");
const paymentRouters = express.Router();
require("dotenv").config();
const vnpayController = require("../controllers/VnpayController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const paypal = require("paypal-rest-sdk");
const PaymentController = require("../controllers/PaymentController");
const paymentController = new PaymentController();
/**
 * @swagger
 * /api/payments/vnpay:
 *   post:
 *     summary: Create a VNPay payment URL
 *     description: Generates a VNPay payment URL for the specified amount, PASTE IT TO A BROWSER TO USE.
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500000
 *                 description: The amount to be paid in VND
 *             required:
 *               - amount
 *     responses:
 *       '200':
 *         description: Successfully generated VNPay payment URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
 *                   description: The VNPay payment URL
 *       '400':
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid amount"
 *       '401':
 *         description: Unauthorized - Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized access"
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
paymentRouters.post("/vnpay", AuthMiddleware, vnpayController.createPaymentUrl);

paymentRouters.get("/vnpay/callback", vnpayController.vnpayReturn);

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

/**
 * @swagger
 * /api/payments/googlepay:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Pay with Google Pay
 *     tags: [Payments]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PayWithGooglePayDto'
 *     responses:
 *       200:
 *         description: Pay with Google Pay successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
paymentRouters.post(
  "/googlepay",
  AuthMiddleware,
  paymentController.payWithGooglePayController
);
module.exports = paymentRouters;
