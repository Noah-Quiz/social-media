const express = require("express");
const RoomController = require("../controllers/RoomController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const { uploadFile } = require("../middlewares/storeFile");
const roomController = new RoomController();

const route = express.Router();

route.use(AuthMiddleware);

// Room routes
// route.get("/global-chat", roomController.GlobalChatController);
// route.get("/video-chat", roomController.VideoChatController);

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Create a new room
 *     description: Creates a room with the given name and type (enumMode). The name is required for public, group, or member rooms. Private rooms don't require a name.
 *     operationId: createRoom
 *     tags:
 *       - Room
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the room. Required for public, group, and member rooms.
 *                 example: "Public Room"
 *               enumMode:
 *                 type: string
 *                 description: The type of room. Can be 'public', 'private', 'group', or 'member'.
 *                 enum: ["public", "private", "group", "member"]
 *                 example: "public"
 *     responses:
 *       201:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 room:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: "ID of the created room"
 *                       example: "60d5f60d18b3a645edaf3b6d"
 *                     name:
 *                       type: string
 *                       description: "Name of the room"
 *                       example: "Public Room"
 *                     enumMode:
 *                       type: string
 *                       description: "Type of the room"
 *                       enum: ["public", "private", "group", "member"]
 *                       example: "public"
 *                 message:
 *                   type: string
 *                   description: "A success message"
 *                   example: "Success"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid query enumMode, must be one of ['public', 'private', 'group', 'member']"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
route.post(
    "/", 
    uploadFile.single("roomCreateImg"),
    roomController.createRoomController
);

route.get("/dm-room/:targetedUserId", roomController.DirectMessageController);

route.get("/:roomId", roomController.GetRoomController);

route.get("/all-room", roomController.GetAllRoomsController);

route.put("/:roomId", roomController.updateRoomController);

route.delete("/:roomId", roomController.DeleteRoomController);

route.get("/all-dm-room", roomController.UserChatRoomsController);

route.put("/group-chat/member", roomController.handleMemberGroupChatController);

module.exports = route;
