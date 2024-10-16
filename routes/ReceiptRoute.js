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
 *         description: Get all user receipts successfully
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
 *         description: Delete a receipt successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
route.delete("/:id", receiptController.deleteReceiptController);

module.exports = route;
