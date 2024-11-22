const express = require("express");
const RoomController = require("../controllers/RoomController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const { uploadFile } = require("../middlewares/storeFile");
const UserEnum = require("../enums/UserEnum");
const requireRole = require("../middlewares/requireRole");
const roomController = new RoomController();

const route = express.Router();

route.use(AuthMiddleware);

/**
 * @swagger
 * /api/rooms/private:
 *   post:
 *     summary: Create a private room
 *     description: Creates a private room between two users. The authenticated user and the recipient must both exist. If a private room between these users already exists, the request will fail.
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientId:
 *                 type: string
 *                 description: The ID of the recipient user for the private room.
 *                 example: "670f3c921b9dbd8d6ea183f7"
 *     responses:
 *       201:
 *         description: Private room created successfully
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
 *                     participants:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             description: ID of the participant.
 *                             example: "670f3c921b9dbd8d6ea183f7"
 *                           joinedDate:
 *                             type: string
 *                             format: date-time
 *                             description: When the user joined the room.
 *                             example: "2024-11-20T12:00:00.000Z"
 *                     enumMode:
 *                       type: string
 *                       description: "Type of the room"
 *                       enum: ["private"]
 *                       example: "private"
 *                 message:
 *                   type: string
 *                   description: "A success message"
 *                   example: "Success"
 *       404:
 *         description: User not found or private room already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Recipient not found"
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
    "/private", 
    roomController.createPrivateRoomController
);

/**
 * @swagger
 * /api/rooms/public:
 *   post:
 *     summary: Create a public room
 *     description: Creates a public room with the provided name. The user must be an admin to create public room. Only one public room exist at a time.
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the public room.
 *                 example: "Public Room"
 *     responses:
 *       201:
 *         description: Public room created successfully
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
 *                       enum: ["public"]
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
 *                   example: "Invalid input: Room name is required."
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
    "/public",
    requireRole(UserEnum.ADMIN),
    roomController.createPublicRoomController
);

/**
 * @swagger
 * /api/rooms/group:
 *   post:
 *     summary: Create a group room
 *     description: Creates a group room with the provided name, participants, and optional avatar image. The user must be authenticated to create the room.
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the group room.
 *                 example: "Team A"
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: "ID of a participant in the group room."
 *                   example: "60d5f60d18b3a645edaf3b6d"
 *               roomCreateImg:
 *                 type: string
 *                 format: binary
 *                 description: The image file for the room avatar (optional).
 *     responses:
 *       201:
 *         description: Group room created successfully
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
 *                       example: "Team A"
 *                     enumMode:
 *                       type: string
 *                       description: "Type of the room"
 *                       enum: ["group"]
 *                       example: "group"
 *                     avatar:
 *                       type: string
 *                       description: "Avatar image URL for the room (if uploaded)"
 *                       example: "uploads/group-avatar.png"
 *                     participantIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                         description: "IDs of participants"
 *                         example: "60d5f60d18b3a645edaf3b6d"
 *                 message:
 *                   type: string
 *                   description: "A success message"
 *                   example: "Success"
 *       400:
 *         description: Invalid input or missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Room name and participantIds are required"
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
    "/group", 
    uploadFile.single("roomCreateImg"),
    roomController.createGroupRoomController
);

/**
 * @swagger
 * /api/rooms/member:
 *   post:
 *     summary: Create a member room
 *     description: Creates a member room with the provided name, participants, and optional avatar image. The user must be authenticated to create the room.
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the member room.
 *                 example: "Team A"
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: "ID of a participant in the member room."
 *                   example: "60d5f60d18b3a645edaf3b6d"
 *               roomCreateImg:
 *                 type: string
 *                 format: binary
 *                 description: The image file for the room avatar (optional).
 *     responses:
 *       201:
 *         description: member room created successfully
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
 *                       example: "Team A"
 *                     enumMode:
 *                       type: string
 *                       description: "Type of the room"
 *                       enum: ["member"]
 *                       example: "member"
 *                     avatar:
 *                       type: string
 *                       description: "Avatar image URL for the room (if uploaded)"
 *                       example: "uploads/member-avatar.png"
 *                     participantIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                         description: "IDs of participants"
 *                         example: "60d5f60d18b3a645edaf3b6d"
 *                 message:
 *                   type: string
 *                   description: "A success message"
 *                   example: "Success"
 *       400:
 *         description: Invalid input or missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Room name and participantIds are required"
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
    "/member", 
    uploadFile.single("roomCreateImg"),
    roomController.createMemberRoomController
);

route.get("/user", roomController.getUserRoomsController);

route.put("/:roomId/add-participant", roomController.addRoomParticipantController);

route.put("/:roomId/remove-participant", roomController.removeRoomParticipantController);

route.get("/:roomId", roomController.getRoomController);

/**
 * @swagger
 * /api/rooms/{roomId}:
 *   put:
 *     summary: Update a room by ID
 *     description: Updates a room's name and avatar image. The user must be authenticated and authorized to update the room.
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the room to update.
 *         example: "60d5f60d18b3a645edaf3b6d"
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The updated name of the room.
 *                 example: "Team A Updated"
 *               roomUpdateImg:
 *                 type: string
 *                 format: binary
 *                 description: The updated image file for the room avatar (optional).
 *     responses:
 *       200:
 *         description: Room updated successfully.
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
 *                       description: ID of the updated room.
 *                       example: "60d5f60d18b3a645edaf3b6d"
 *                     name:
 *                       type: string
 *                       description: Name of the room.
 *                       example: "Team A Updated"
 *                     avatar:
 *                       type: string
 *                       description: Avatar image URL for the room (if updated).
 *                       example: "uploads/team-a-updated.png"
 *                 message:
 *                   type: string
 *                   description: A success message.
 *                   example: "Success"
 *       400:
 *         description: Invalid input or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid roomId or input data."
 *       401:
 *         description: Unauthorized access.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access."
 *       404:
 *         description: Room not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Room not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error."
 */
route.put(
    "/:roomId", 
    uploadFile.single("roomUpdateImg"),
    roomController.updateRoomController
);

route.delete("/:roomId", roomController.deleteRoomController);

module.exports = route;
