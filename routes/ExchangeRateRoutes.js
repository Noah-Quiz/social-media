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
 *     summary: Get current exchange rates
 *     tags: [ExchangeRates]
 *     responses:
 *       200:
 *         description: Get exchange rates successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exchangeRates:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *                   example: {
 *                     "topUpCoinRate": 15,
 *                     "exchangeRateBalanceToCoin": 0.9,
 *                     "exchangeRateCoinToBalance": 0.9,
 *                     "coinPer1000View": 1500000,
 *                     "pointToCoin": 1,
 *                     "dailyPoint": 1000,
 *                     "streakBonus": 100,
 *                     "ReceivePercentage": 0.85,
 *                     "topUpBalanceRate": 0.00004
 *                   }
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
  exchangeRateController.getAllExchangeRatesController
);
/**
 * @swagger
 * /api/exchange-rate/by-name:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Update an exchange rate using its name
 *     tags: [ExchangeRates]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           example: "pointToCoin"
 *         description: The name of the exchange rate to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: number
 *                 example: 0.01
 *                 description: "New value for the exchange rate"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *                 description: "New description for the exchange rate"
 *     responses:
 *       200:
 *         description: Exchange rate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exchangeRate:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "671b69bece9b9399d011ea78"
 *                       description: "The unique identifier of the exchange rate"
 *                     name:
 *                       type: string
 *                       example: "pointToCoin"
 *                       description: "The name of the exchange rate"
 *                     value:
 *                       type: number
 *                       example: 0.01
 *                       description: "The updated value of the exchange rate"
 *                     description:
 *                       type: string
 *                       example: "1000 point = 10 coin"
 *                       description: "The updated description of the exchange rate"
 *                     isDeleted:
 *                       type: boolean
 *                       example: false
 *                       description: "Indicates if the exchange rate is deleted"
 *                     dateCreated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-25T09:49:50.900Z"
 *                       description: "The date the exchange rate was created"
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-25T09:49:50.900Z"
 *                       description: "The date the exchange rate was last updated"
 *                     __v:
 *                       type: integer
 *                       example: 0
 *                       description: "The version key"
 *                 message:
 *                   type: string
 *                   example: "Updated successfully"
 *       400:
 *         description: Missing or invalid `name` query parameter
 *       404:
 *         description: Exchange rate not found
 *       500:
 *         description: Internal server error
 */

exchangeRateRoutes.put(
  "/by-name",
  requireRole(UserEnum.ADMIN),
  exchangeRateController.updateExchangeRateByNameController
);

/**
 * @swagger
 * /api/exchange-rate/by-id/{id}:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Update an exchange rate using its ID
 *     tags: [ExchangeRates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "672328f60427946cbe166f45"
 *         description: The ID of the exchange rate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: number
 *                 example: 1
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *     responses:
 *       200:
 *         description: Exchange rate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exchangeRate:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "671b69bece9b9399d011ea78"
 *                       description: "The unique identifier of the exchange rate"
 *                     name:
 *                       type: string
 *                       example: "pointToCoin"
 *                       description: "The name of the exchange rate"
 *                     value:
 *                       type: number
 *                       example: 0.01
 *                       description: "The updated value of the exchange rate"
 *                     description:
 *                       type: string
 *                       example: "1000 point = 10 coin"
 *                       description: "The updated description of the exchange rate"
 *                     isDeleted:
 *                       type: boolean
 *                       example: false
 *                       description: "Indicates if the exchange rate is deleted"
 *                     dateCreated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-25T09:49:50.900Z"
 *                       description: "The date the exchange rate was created"
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-25T09:49:50.900Z"
 *                       description: "The date the exchange rate was last updated"
 *                     __v:
 *                       type: integer
 *                       example: 0
 *                       description: "The version key"
 *                 message:
 *                   type: string
 *                   example: "Updated successfully"
 *       400:
 *         description: Missing or invalid `id` path parameter
 *       404:
 *         description: Exchange rate not found
 *       500:
 *         description: Internal server error
 */

exchangeRateRoutes.put(
  "/by-id/:id",
  requireRole(UserEnum.ADMIN),
  exchangeRateController.updateExchangeRateByIdController
);

/**
 * @swagger
 * /api/exchange-rate/by-name:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     summary: Delete an exchange rate using its name
 *     tags: [ExchangeRates]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           example: "topUpBalanceRate"  # Keeping the example here
 *         description: The name of the exchange rate to delete
 *     responses:
 *       200:
 *         description: Exchange rate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exchangeRate:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "671b69bece9b9399d011ea78"
 *                     name:
 *                       type: string
 *                       example: "pointToCoin"
 *                     value:
 *                       type: number
 *                       example: 0.01
 *                     isDeleted:
 *                       type: boolean
 *                       example: true
 *                     dateCreated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-25T09:49:50.900Z"
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-25T09:49:50.900Z"
 *                     __v:
 *                       type: integer
 *                       example: 0
 *                     description:
 *                       type: string
 *                       example: "1000 point = 10 coin"
 *                 message:
 *                   type: string
 *                   example: "Deleted successfully"
 *       400:
 *         description: Missing or invalid name query parameter
 *       404:
 *         description: Exchange rate not found
 *       500:
 *         description: Internal server error
 */

exchangeRateRoutes.delete(
  "/by-name",
  requireRole(UserEnum.ADMIN),
  exchangeRateController.deleteExchangeRateByNameController
);

/**
 * @swagger
 * /api/exchange-rate/by-id/{id}:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     summary: Delete an exchange rate using its ID
 *     tags: [ExchangeRates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "672328f60427946cbe166f45"
 *         description: The ID of the exchange rate to delete
 *     responses:
 *       200:
 *         description: Exchange rate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exchangeRate:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "671b69bece9b9399d011ea78"
 *                     name:
 *                       type: string
 *                       example: "pointToCoin"
 *                     value:
 *                       type: number
 *                       example: 0.01
 *                     isDeleted:
 *                       type: boolean
 *                       example: true
 *                     dateCreated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-25T09:49:50.900Z"
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-25T09:49:50.900Z"
 *                     __v:
 *                       type: integer
 *                       example: 0
 *                     description:
 *                       type: string
 *                       example: "1000 point = 10 coin"
 *                 message:
 *                   type: string
 *                   example: "Deleted successfully"
 *       400:
 *         description: Missing or invalid name query parameter
 *       404:
 *         description: Exchange rate not found
 *       500:
 *         description: Internal server error
 */

exchangeRateRoutes.delete(
  "/by-id/:id",
  requireRole(UserEnum.ADMIN),
  exchangeRateController.deleteExchangeRateByIdController
);

/**
 * @swagger
 * /api/exchange-rate/by-id/{id}:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get an exchange rate using its ID
 *     tags: [ExchangeRates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "672328f60427946cbe166f45"
 *         description: The ID of the exchange rate
 *     responses:
 *       200:
 *         description: Fetched exchange rate successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exchangeRate:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "674025d3432439761dacf9e7"
 *                     name:
 *                       type: string
 *                       example: "topUpBalanceRate"
 *                     value:
 *                       type: integer
 *                       example: 1
 *                     description:
 *                       type: string
 *                       example: "25000VND = 1 balance"
 *                     isDeleted:
 *                       type: boolean
 *                       example: false
 *                     dateCreated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-22T06:33:55.338Z"
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-22T06:33:55.338Z"
 *                     __v:
 *                       type: integer
 *                       example: 0
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       400:
 *         description: Bad request, invalid ID
 *       404:
 *         description: Exchange rate not found
 *       500:
 *         description: Internal server error
 */

exchangeRateRoutes.get(
  "/by-id/:id",
  exchangeRateController.getExchangeRateByIdController
);

/**
 * @swagger
 * /api/exchange-rate/by-name:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get an exchange rate using its name
 *     tags: [ExchangeRates]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           example: "topUpBalanceRate"
 *         description: The name of the exchange rate to fetch
 *     responses:
 *       200:
 *         description: Fetched exchange rate successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exchangeRate:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "674025d3432439761dacf9e7"
 *                     name:
 *                       type: string
 *                       example: "topUpBalanceRate"
 *                     value:
 *                       type: integer
 *                       example: 1
 *                     description:
 *                       type: string
 *                       example: "25000VND = 1 balance"
 *                     isDeleted:
 *                       type: boolean
 *                       example: false
 *                     dateCreated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-22T06:33:55.338Z"
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-22T06:33:55.338Z"
 *                     __v:
 *                       type: integer
 *                       example: 0
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       400:
 *         description: Missing or invalid `name` query parameter
 *       404:
 *         description: Exchange rate not found
 *       500:
 *         description: Internal server error
 */

exchangeRateRoutes.get(
  "/by-name",
  exchangeRateController.getExchangeRateByNameController
);

module.exports = exchangeRateRoutes;
