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
 *             $ref: '#/components/schemas/UpdateExchangeRateDto'
 *     responses:
 *       200:
 *         description: Create a exchange rate successfully
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
 * /api/exchange-rate/{id}:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Update a exchange rate by ID
 *     tags: [ExchangeRates]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateExchangeRateDto'
 *     responses:
 *       200:
 *         description: Update a exchange rate successfully
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
 * /api/exchange-rate/{id}:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     summary: Delete a exchange rate by ID
 *     tags: [ExchangeRates]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Delete a exchange rate successfully
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
