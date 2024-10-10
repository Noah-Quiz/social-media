const express = require("express");
const RoomController = require("../controllers/RoomController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const roomController = new RoomController();

const route = express.Router();

// Apply the authentication middleware to all routes
route.use(AuthMiddleware);

// Room routes
route.get("/global-chat", roomController.GlobalChatController);
route.get("/dm-room", roomController.DirectMessageController);
route.get("/video-chat", roomController.VideoChatController);
route.post("/create", roomController.CreateRoomController);
route.get("/get-one/:id", roomController.GetRoomController);
route.get("/all-room", roomController.GetAllRoomsController);
route.put("/:id", roomController.UpdateRoomController);
route.delete("/:id", roomController.DeleteRoomController);
route.get("/all-dm-room", roomController.UserChatRoomsController);

module.exports = route;
