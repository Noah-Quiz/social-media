const express = require("express");
const MessageController = require("../controllers/MessageController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const messageController = new MessageController();

const messageRoutes = express.Router();
messageRoutes.use(AuthMiddleware);

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Create a new message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMessageDto'
 *     responses:
 *       201:
 *         description: Create a message successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
messageRoutes.post("/", messageController.createAMessageController);

/**
 * @swagger
 * /api/messages/room-messages:
 *   get:
 *     summary: Send verification email to user
 *     tags: [Messages]
 *     parameters:
 *      - in: query
 *        name: roomId
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Send verification email successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
messageRoutes.get("/room-messages", messageController.getMessagesController);

/**
 * @swagger
 * /api/messages/{messageId}:
 *   delete:
 *     summary: Delete a message by ID
 *     tags: [Messages]
 *     parameters:
 *      - in: path
 *        name: roomId
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Delete message successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
messageRoutes.delete("/:messageId", messageController.deleteMessageController);

/**
 * @swagger
 * /api/messages/{messageId}:
 *   get:
 *     summary: Get a message by ID
 *     tags: [Messages]
 *     parameters:
 *      - in: path
 *        name: roomId
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Get message successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
messageRoutes.get("/:messageId", messageController.getMessageController);

/**
 * @swagger
 * /api/messages/{messageId}:
 *   put:
 *     summary: Update a message by ID
 *     tags: [Messages]
 *     parameters:
 *      - in: path
 *        name: messageId
 *        schema:
 *         type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMessageDto'
 *     responses:
 *       200:
 *         description: Update message successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
messageRoutes.put("/:messageId", messageController.updateMessageController);

module.exports = messageRoutes;
