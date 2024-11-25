const express = require("express");
const MessageController = require("../controllers/MessageController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const messageController = new MessageController();

const messageRoutes = express.Router();
messageRoutes.use(AuthMiddleware);

messageRoutes.post("/", messageController.createAMessageController);

/**
 * @swagger
 * /api/messages/room/{roomId}:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Retrieve all messages in a specific room
 *     tags: [Messages]
 *     parameters:
 *      - in: path
 *        name: roomId
 *        schema:
 *         type: string
 *         required: true
 *         description: ID of the room to retrieve messages from
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          example: 1
 *        description: Page number for pagination
 *      - in: query
 *        name: size
 *        schema:
 *          type: integer
 *          example: 20
 *        description: Number of messages per page
 *      - in: query
 *        name: content
 *        schema:
 *          type: string
 *        description: Search for messages containing this string
 *     responses:
 *       200:
 *         description: Successfully retrieved messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 totalPages:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalMessages:
 *                   type: integer
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       404:
 *         description: No messages found
 *       500:
 *         description: Internal server error
 */
messageRoutes.get("/room/:roomId", messageController.getMessagesController);

/**
 * @swagger
 * /api/messages/{messageId}:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     summary: Delete a message by ID
 *     tags: [Messages]
 *     parameters:
 *      - in: path
 *        name: messageId
 *        schema:
 *         type: string
 *         required: true
 *         description: ID of the message to delete
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 */
messageRoutes.delete("/:messageId", messageController.deleteMessageController);

/**
 * @swagger
 * /api/messages/{messageId}:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Retrieve a message by ID
 *     tags: [Messages]
 *     parameters:
 *      - in: path
 *        name: messageId
 *        schema:
 *         type: string
 *         required: true
 *         description: ID of the message to retrieve
 *     responses:
 *       200:
 *         description: Message retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 */
messageRoutes.get("/:messageId", messageController.getMessageController);

/**
 * @swagger
 * /api/messages/{messageId}:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Update a message by ID
 *     tags: [Messages]
 *     parameters:
 *      - in: path
 *        name: messageId
 *        schema:
 *         type: string
 *         required: true
 *         description: ID of the message to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMessageDto'
 *     responses:
 *       200:
 *         description: Message updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/UpdateMessageDto'
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
messageRoutes.put("/:messageId", messageController.updateMessageController);

module.exports = messageRoutes;
