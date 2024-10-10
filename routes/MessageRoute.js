const express = require("express");
const MessageController = require("../controllers/MessageController");
const messageController = new MessageController();

const messageRoutes = express.Router();

messageRoutes.post("/", messageController.createAMessageController);

messageRoutes.get("/room-messages", messageController.getMessagesController);

messageRoutes.delete("/:messageId", messageController.deleteMessageController);

messageRoutes.get(
  "/:messageId",

  messageController.getMessageController
);

messageRoutes.put("/:messageId", messageController.updateMessageController);

module.exports = messageRoutes;
