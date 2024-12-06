const express = require("express");
const GiftHistoryController = require("../controllers/GiftHistoryController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const giftHistoryController = new GiftHistoryController();

const giftHistoryRoutes = express.Router();
giftHistoryRoutes.use(AuthMiddleware);

/**
 * @swagger
 * tags:
 *   name: GiftHistory
 *   description: Gift history management API
 */

/**
 * @swagger
 * /api/gift-history/:
 *   post:
 *     summary: Create a gift history record
 *     tags: [GiftHistory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               streamId:
 *                 type: string
 *                 description: The ID of the stream
 *               gifts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     giftId:
 *                       type: string
 *                       description: The ID of the gift
 *                     quantity:
 *                       type: integer
 *                       description: Quantity of the gift
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad Request
 */
giftHistoryRoutes.post("/", giftHistoryController.createGiftHistoryController);

/**
 * @swagger
 * /api/gift-history/streams/{streamId}:
 *   get:
 *     summary: Get gift history by stream ID, viewed by stream owner or admin
 *     tags: [GiftHistory]
 *     parameters:
 *       - in: path
 *         name: streamId
 *         schema:
 *           type: string
 *         required: true
 *         description: The stream ID
 *     responses:
 *       200:
 *         description: Success
 */
giftHistoryRoutes.get(
  "/streams/:streamId",
  giftHistoryController.getGiftHistoryByStreamIdController
);

/**
 * @swagger
 * /api/gift-history/:
 *   get:
 *     summary: Get gift history by user ID in token
 *     tags: [GiftHistory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
giftHistoryRoutes.get(
  "/",
  giftHistoryController.getGiftHistoryByUserIdController
);

/**
 * @swagger
 * /api/gift-history/{id}:
 *   get:
 *     summary: Get a specific gift by ID
 *     tags: [GiftHistory]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The gift ID
 *     responses:
 *       200:
 *         description: Success
 */
giftHistoryRoutes.get("/:id", giftHistoryController.getGiftController);

/**
 * @swagger
 * /api/gift-history/{id}:
 *   delete:
 *     summary: Delete a gift history record
 *     tags: [GiftHistory]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The gift history ID
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
giftHistoryRoutes.delete(
  "/:id",
  giftHistoryController.deleteGiftHistoryController
);

module.exports = giftHistoryRoutes;
