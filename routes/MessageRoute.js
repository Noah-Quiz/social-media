const express = require("express");
const MessageController = require("../controllers/MessageController");
const messageController = new MessageController();

const messageRoutes = express.Router();

messageRoutes.post("/messages", messageController.createAMessage);

messageRoutes.get("/messages/room-messages", messageController.getMessages);

messageRoutes.delete("/messages/:messageId", messageController.deleteMessage);

messageRoutes.get(
  "/messages/:messageId",

  messageController.getMessage
);

messageRoutes.put("/messages/:messageId", messageController.updateMessage);

module.exports = messageRoutes;
