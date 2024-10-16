const express = require("express");
const GiftController = require("../controllers/GiftController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const giftController = new GiftController();

const giftRoutes = express.Router();
giftRoutes.use(AuthMiddleware);

/**
 * @swagger
 * /api/gifts/:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     summary: Create a gift
 *     tags: [Gifts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGiftDto'
 *     responses:
 *       200:
 *         description: Create a gift successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
giftRoutes.post("/", giftController.createGiftController);

/**
 * @swagger
 * /api/gifts/:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get all gifts
 *     tags: [Gifts]
 *     responses:
 *       200:
 *         description: Get all gifts successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
giftRoutes.get("/", giftController.getAllGiftController);

/**
 * @swagger
 * /api/gifts/{id}:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get a gift by ID
 *     tags: [Gifts]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Get a gift by ID successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
giftRoutes.get("/:id", giftController.getGiftController);

/**
 * @swagger
 * /api/gifts/{id}:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Update a gift by ID
 *     tags: [Gifts]
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
 *             $ref: '#/components/schemas/UpdateGiftDto'
 *     responses:
 *       200:
 *         description: Update a gift successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
giftRoutes.put("/:id", giftController.updateGiftController);

/**
 * @swagger
 * /api/gifts/{id}:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     summary: Delete a gift by ID
 *     tags: [Gifts]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Delete a gift by ID successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
giftRoutes.delete("/:id", giftController.deleteGiftController);

module.exports = giftRoutes;
