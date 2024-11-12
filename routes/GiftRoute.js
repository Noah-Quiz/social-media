const express = require("express");
const GiftController = require("../controllers/GiftController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const giftController = new GiftController();
const requireRole = require("../middlewares/requireRole");
const UserEnum = require("../enums/UserEnum");
const giftRoutes = express.Router();
const { uploadFile } = require("../middlewares/storeFile");

giftRoutes.use(AuthMiddleware);

/**
 * @swagger
 * /api/gifts/:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a gift
 *     tags: [Gifts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGiftDto'
 *           example:
 *             name: "string"
 *             image: "string"
 *             valuePerUnit: 0
 *     responses:
 *       200:
 *         description: Create a gift successfully
 *         content:
 *           application/json:
 *             example:
 *               gift:
 *                 name: "string"
 *                 image: "string"
 *                 valuePerUnit: 30000
 *                 _id: "string"
 *                 dateCreated: "2024-10-31T04:21:55.590Z"
 *               message: "Success"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
giftRoutes.post(
  "/",
  requireRole(UserEnum.ADMIN),
  uploadFile.single("giftCreateImg"),
  giftController.createGiftController
);

/**
 * @swagger
 * /api/gifts/:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all gifts
 *     tags: [Gifts]
 *     responses:
 *       200:
 *         description: Get all gifts successfully
 *         content:
 *           application/json:
 *             example:
 *               gifts:
 *                 - _id: "string"
 *                   name: "string"
 *                   image: "string"
 *                   valuePerUnit: 3000
 *                   dateCreated: "2024-10-25T03:13:51.439Z"
 *               message: "Success"
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
 *       - bearerAuth: []
 *     summary: Get a gift by ID
 *     tags: [Gifts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the gift to retrieve
 *     responses:
 *       200:
 *         description: Get a gift by ID successfully
 *         content:
 *           application/json:
 *             example:
 *               gift:
 *                 _id: "string"
 *                 name: "string"
 *                 image: "string"
 *                 valuePerUnit: 15000
 *                 dateCreated: "2024-10-25T03:08:32.839Z"
 *               message: "Success"
 *       404:
 *         description: Gift not found
 *       500:
 *         description: Internal server error
 */
giftRoutes.get("/:id", giftController.getGiftController);

/**
 * @swagger
 * /api/gifts/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a gift by ID
 *     tags: [Gifts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the gift to update
 *     requestBody:
 *       required: true
 *       content:
 *          multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name for the gift
 *               valuePerUnit:
 *                 type: number
 *                 description: The new price for the gift
 *               giftUpdateImg:
 *                 type: string
 *                 format: binary
 *                 description: The gift's image file
 *     responses:
 *       200:
 *         description: Update a gift successfully
 *         content:
 *           application/json:
 *             example:
 *               gift:
 *                 _id: "string"
 *                 name: "string"
 *                 image: "string"
 *                 valuePerUnit: 15000
 *                 dateCreated: "2024-10-25T03:08:32.839Z"
 *               message: "Update success"
 *       404:
 *         description: Gift not found
 *       500:
 *         description: Internal server error
 */
giftRoutes.put(
  "/:id",
  requireRole(UserEnum.ADMIN),
  uploadFile.single("giftUpdateImg"),
  giftController.updateGiftController
);

/**
 * @swagger
 * /api/gifts/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a gift by ID
 *     tags: [Gifts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the gift to delete
 *     responses:
 *       200:
 *         description: Delete a gift by ID successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Deletion success"
 *       404:
 *         description: Gift not found
 *       500:
 *         description: Internal server error
 */
giftRoutes.delete(
  "/:id",
  requireRole(UserEnum.ADMIN),
  giftController.deleteGiftController
);

module.exports = giftRoutes;
