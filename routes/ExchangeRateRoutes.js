const express = require("express");
const ExchangeRateController = require("../controllers/ExchangeRateController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const exchangeRateController = new ExchangeRateController();
const requireRole = require("../middlewares/requireRole");
const UserEnum = require("../enums/UserEnum");
const exchangeRateRoutes = express.Router();
exchangeRateRoutes.use(AuthMiddleware);

/**
 * @swagger
 * /api/exchange-rate/:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     summary: Create a exchange rate
 *     tags: [ExchangeRates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExchangeRateDto'
 *     responses:
 *       200:
 *         description: Create a exchange rate successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exchangeRate:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "string"
 *                       value:
 *                         type: number
 *                         example: 1
 *                       description:
 *                         type: string
 *                         example: "string"
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       _id:
 *                         type: string
 *                         example: "string"
 *                       dateCreated:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-10-31T06:51:34.546Z"
 *                       lastUpdated:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-10-31T06:51:34.546Z"
 *                       __v:
 *                         type: integer
 *                         example: 0
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
exchangeRateRoutes.post(
  "/",
  requireRole(UserEnum.ADMIN),
  exchangeRateController.createExchangeRateController
);

/**
 * @swagger
 * /api/exchange-rate:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get current exchange rate
 *     tags: [ExchangeRates]
 *     responses:
 *       200:
 *         description: Get exchange rate successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exchangeRate:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "string"
 *                       value:
 *                         type: number
 *                         example: 1
 *                       description:
 *                         type: string
 *                         example: "string"
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       _id:
 *                         type: string
 *                         example: "672328f60427946cbe166f45"
 *                       dateCreated:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-10-31T06:51:34.546Z"
 *                       lastUpdated:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-10-31T06:51:34.546Z"
 *                       __v:
 *                         type: integer
 *                         example: 0
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
exchangeRateRoutes.get(
  "/",
  requireRole(UserEnum.ADMIN),
  exchangeRateController.getExchangeRateController
);

/**
 * @swagger
 * /api/exchange-rate:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Update an exchange rate
 *     tags: [ExchangeRates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *                 example: "topUpBalanceRate"
 *               value:
 *                 type: number
 *                 example: 1
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *     responses:
 *       200:
 *         description: Update exchange rate successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exchangeRate:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "topUpBalanceRate"
 *                     value:
 *                       type: number
 *                       example: 1
 *                     description:
 *                       type: string
 *                       example: "Updated description"
 *                     isDeleted:
 *                       type: boolean
 *                       example: false
 *                     _id:
 *                       type: string
 *                       example: "672328f60427946cbe166f45"
 *                     dateCreated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-31T06:51:34.546Z"
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-31T06:51:34.546Z"
 *                     __v:
 *                       type: integer
 *                       example: 0
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
exchangeRateRoutes.put(
  "/",
  requireRole(UserEnum.ADMIN),
  exchangeRateController.updateExchangeRateController
);

/**
 * @swagger
 * /api/exchange-rate:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     summary: Delete an exchange rate
 *     tags: [ExchangeRates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *                 example: "topUpBalanceRate"
 *     responses:
 *       200:
 *         description: Delete exchange rate successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
exchangeRateRoutes.delete(
  "/",
  requireRole(UserEnum.ADMIN),
  exchangeRateController.deleteExchangeRateController
);

module.exports = exchangeRateRoutes;
