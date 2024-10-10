const mongoose = require("mongoose");
const {
  deleteMessageService,
  findMessageService,
  findAllMessagesByRoomIdService,
  createAMessageService,
  updateMessageService,
} = require("../services/MessageService");

class MessageController {
  async getMessageController(req, res) {
    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }
    try {
      const message = await findMessageService(messageId);
      if (!message) {
        res
          .status(404)
          .json({ message: `No message found for id: ${messageId}` });
      }
      res.status(200).json({ message, message: "Success" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getMessagesController(req, res) {
    const { roomId } = req.query; // Extract roomId from the query

    if (!roomId) {
      return res.status(400).json({ error: "roomId is required" });
    }

    try {
      const messages = await findAllMessagesByRoomIdService(roomId);
      if (!messages || messages.length === 0) {
        return res
          .status(404)
          .json({ message: `No messages found for room: ${roomId}` });
      }
      res.status(200).json({ data: messages, message: "Success" });
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error fetching messages: ${error.message}` });
    }
  }

  async updateMessageController(req, res) {
    const { messageId } = req.params;
    const { content } = req.body;
    const updateData = { content };

    try {
      const message = await updateMessageService(messageId, updateData);

      res.status(200).json({ data: message, message: "Success" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteMessageController(req, res) {
    const { messageId } = req.params;
    try {
      await deleteMessageService(messageId);
      res.status(200).json({ message: "Success" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createAMessageController(req, res) {
    const { userId, roomId, content } = req.body;
    try {
      const message = await createAMessageService(userId, roomId, content);
      res.status(200).json({ message: "Success" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = MessageController;
