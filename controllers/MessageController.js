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
  async getMessageController(req, res, next) {
    try {
      const { messageId } = req.params;
      const getMessageDto = new GetMessageDto(messageId);
      await getMessageDto.validate();

      const message = await findMessageService(messageId);
      if (!message) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          `Message with id ${messageId} not found`
        );
      }
      res
        .status(StatusCodeEnums.OK_200)
        .json({ data: message, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async getMessagesController(req, res, next) {
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
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "No messages found"
        );
      }
      res.status(StatusCodeEnums.OK_200).json({
        messages,
        totalPages,
        page,
        totalMessages,
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMessageController(req, res, next) {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      const userId = req.userId;
      const updateData = content;
      console.log("Content: ", content, typeof content);
      const updateMessageDto = new UpdateMessageDto(messageId, content, userId);
      await updateMessageDto.validate();

      const message = await updateMessageService(userId, messageId, updateData);

      res
        .status(StatusCodeEnums.OK_200)
        .json({ data: message, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async deleteMessageController(req, res, next) {
    try {
      const { messageId } = req.params;
      const userId = req.userId;
      const deleteMessageDto = new DeleteMessageDto(messageId, userId);
      await deleteMessageDto.validate();

      await deleteMessageService(userId, messageId);
      res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async createAMessageController(req, res, next) {
    try {
      const userId = req.userId;
      const { roomId, content } = req.body;
      const createMessageDto = new CreateMessageDto(userId, roomId, content);
      await createMessageDto.validate();

      const message = await createAMessageService(userId, roomId, content);
      res
        .status(StatusCodeEnums.Created_201)
        .json({ data: message, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MessageController;
