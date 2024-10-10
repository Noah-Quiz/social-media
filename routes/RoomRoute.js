const express = require("express");
const RoomController = require("../controllers/RoomController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const roomController = new RoomController();

const route = express.Router();

// Apply the authentication middleware to all routes
route.use(AuthMiddleware);

// Room routes
route.get("/global-chat", roomController.GlobalChat);
route.get("/dm-room", roomController.DirectMessage);
route.get("/video-chat", roomController.VideoChat);
route.post("/create", roomController.CreateRoom);
route.get("/get-one/:id", roomController.GetRoom);
route.get("/all-room", roomController.GetAllRooms);
route.put("/:id", roomController.UpdateRoom);
route.delete("/:id", roomController.DeleteRoom);
route.get("/all-dm-room", roomController.UserChatRooms);

route.put("/group-chat/member", roomController.handleMemberGroupChatController);

module.exports = route;
