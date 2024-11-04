const express = require("express");
const ReceiptController = require("../controllers/ReceiptController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const receiptController = new ReceiptController();

const route = express.Router();

// Apply the authentication mid dleware to all routes
route.use(AuthMiddleware);

/**
 * @swagger
 * /api/receipts:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get all user receipts
 *     tags: [Receipts]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 receipts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       paymentMethod:
 *                         type: string
 *                       paymentPort:
 *                         type: string
 *                       bankCode:
 *                         type: string
 *                       amount:
 *                         type: integer
 *                       transactionId:
 *                         type: string
 *                       type:
 *                         type: string
 *                       exchangeRate:
 *                         type: integer
 *                       isDeleted:
 *                         type: boolean
 *                         example: "false"
 *                       dateCreated:
 *                         type: string
 *                         format: date-time
 *                       lastUpdated:
 *                         type: string
 *                         format: date-time
 *                 size:
 *                   type: integer
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
route.get("/", receiptController.getAllUserReceiptsController);

/**
 * @swagger
 * /api/receipts/{id}:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get a receipt by ID
 *     tags: [Receipts]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Get a receipt successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 receipts:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       paymentMethod:
 *                         type: string
 *                       paymentPort:
 *                         type: string
 *                       bankCode:
 *                         type: string
 *                       amount:
 *                         type: integer
 *                       transactionId:
 *                         type: string
 *                       type:
 *                         type: string
 *                       exchangeRate:
 *                         type: integer
 *                       isDeleted:
 *                         type: boolean
 *                         example: "false"
 *                       dateCreated:
 *                         type: string
 *                         format: date-time
 *                       lastUpdated:
 *                         type: string
 *                         format: date-time
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
route.get("/:id", receiptController.getReceiptController);

/**
 * @swagger
 * /api/receipts/{id}:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     summary: Delete a receipt by ID
 *     tags: [Receipts]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Successful deletion response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 receipt:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     paymentMethod:
 *                       type: string
 *                     paymentPort:
 *                       type: string
 *                     bankCode:
 *                       type: string
 *                     amount:
 *                       type: integer
 *                     transactionId:
 *                       type: string
 *                     type:
 *                       type: string
 *                     exchangeRate:
 *                       type: integer
 *                     isDeleted:
 *                       type: boolean
 *                     dateCreated:
 *                       type: string
 *                       format: date-time
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
route.delete("/:id", receiptController.deleteReceiptController);

module.exports = route;
