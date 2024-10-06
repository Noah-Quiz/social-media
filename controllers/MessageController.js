const mongoose = require("mongoose");
const {
  deleteMessageService,
  findMessage,
  findAllMessagesByRoomId,
  createAMessageService,
  updateMessageService,
} = require("../services/MessageService");

class MessageController {
  async getMessage(req, res) {
    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }
    try {
      const message = await findMessage(messageId);
      if (!message) {
        res
          .status(404)
          .json({ message: `No message found for id: ${messageId}` });
      }
      res.status(200).json({ data: message, message: "Success" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMessages(req, res) {
    const { roomId } = req.query; // Extract roomId from the query

    if (!roomId) {
      return res.status(400).json({ error: "roomId is required" });
    }

    try {
      const messages = await findAllMessagesByRoomId(roomId);
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

  async updateMessage(req, res) {
    const { messageId } = req.params;
    const { content } = req.body;
    const updateData = { content };

    try {
      const message = await updateMessageService(messageId, updateData);

      res.status(200).json({ data: message, message: "Success" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteMessage(req, res) {
    const { messageId } = req.params;
    try {
      await deleteMessageService(messageId);
      res.status(200).json({ message: "Success" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createAMessage(req, res) {
    const { userId, roomId, content } = req.body;
    try {
      const message = await createAMessageService(userId, roomId, content);
      res.status(200).json({ message: "Success" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = MessageController;
