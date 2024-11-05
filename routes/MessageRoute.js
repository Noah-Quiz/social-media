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
 *     security:
 *      - bearerAuth: []
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: string
 *                       example: "Hello global"
 *                     roomId:
 *                       type: string
 *                       example: "6705fe54a94dffa584e0dbe7"
 *                     userId:
 *                       type: string
 *                       example: "66f6577eb4ffd9ae01870e72"
 *                     isDeleted:
 *                       type: boolean
 *                       example: false
 *                     _id:
 *                       type: string
 *                       example: "6729cf0c414f24486d055012"
 *                     dateCreated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-05T07:53:48.253Z"
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-05T07:53:48.253Z"
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
messageRoutes.post("/", messageController.createAMessageController);

/**
 * @swagger
 * /api/messages/room-messages:
 *   get:
 *     security:
 *      - bearerAuth: []
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
 *     security:
 *      - bearerAuth: []
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
