const mongoose = require("mongoose");
const {
  deleteMessageService,
  findMessageService,
  findMessagesByRoomIdService,
  createAMessageService,
  updateMessageService,
} = require("../services/MessageService");
const CreateMessageDto = require("../dtos/Message/CreateMessageDto");
const CoreException = require("../exceptions/CoreException");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const GetMessagesDto = require("../dtos/Message/GetMessagesDto");
const UpdateMessageDto = require("../dtos/Message/UpdateMessageDto");
const GetMessageDto = require("../dtos/Message/GetMessageDto");
const DeleteMessageDto = require("../dtos/Message/DeleteMessageDto");

class MessageController {
  async getMessageController(req, res) {
    try {
      const { messageId } = req.params;
      const getMessageDto = new GetMessageDto(messageId);
      await getMessageDto.validate();

      const message = await findMessageService(messageId);
      if (!message) {
        res
          .status(404)
          .json({ message: `No message found for id: ${messageId}` });
      }
      res
        .status(StatusCodeEnums.OK_200)
        .json({ data: message, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async getMessagesController(req, res) {
    try {
      const query = req.query;

      if (!query.page || query.page < 1) query.page = 1;
      if (!query.size || query.size < 1) query.size = 20; // Extract roomId from the query
      const { roomId } = req.params;

      const getMessagesDto = new GetMessagesDto(roomId);
      await getMessagesDto.validate();

      const { messages, totalPages, page, totalMessages } =
        await findMessagesByRoomIdService(roomId, query.page, query.size);
      if (!messages || messages.length === 0) {
        return res
          .status(404)
          .json({ message: `No messages found for room: ${roomId}` });
      }
      res.status(StatusCodeEnums.OK_200).json({
        messages,
        totalPages,
        page,
        totalMessages,
        message: "Success",
      });
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async updateMessageController(req, res) {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      const userId = req.userId;
      const updateData = { content };

      const updateMessageDto = new UpdateMessageDto(messageId, content, userId);
      await updateMessageDto.validate();

      const message = await updateMessageService(userId, messageId, updateData);

      res
        .status(StatusCodeEnums.OK_200)
        .json({ data: message, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async deleteMessageController(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.userId;
      const deleteMessageDto = new DeleteMessageDto(messageId, userId);
      await deleteMessageDto.validate();

      await deleteMessageService(userId, messageId);
      res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async createAMessageController(req, res) {
    try {
      const userId = req.userId;
      const { roomId, content } = req.body;
      // const userId = req.userId;
      const createMessageDto = new CreateMessageDto(userId, roomId, content);
      await createMessageDto.validate();

      const message = await createAMessageService(userId, roomId, content);
      res
        .status(StatusCodeEnums.OK_200)
        .json({ data: message, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }
}

module.exports = MessageController;
