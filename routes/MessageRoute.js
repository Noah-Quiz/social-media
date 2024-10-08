const express = require("express");
const MessageController = require("../controllers/MessageController");
const messageController = new MessageController();

const messageRoutes = express.Router();

messageRoutes.post("/", messageController.createAMessage);

messageRoutes.get("/room-messages", messageController.getMessages);

messageRoutes.delete("/:messageId", messageController.deleteMessage);

messageRoutes.get(
  "/:messageId",

  messageController.getMessage
);

messageRoutes.put("/:messageId", messageController.updateMessage);

module.exports = messageRoutes;
