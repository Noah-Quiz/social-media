const mongoose = require("mongoose");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const { contentModeration, validLength } = require("../utils/validator");
const CoreException = require("../exceptions/CoreException");
const StatusCodeEnums = require("../enums/StatusCodeEnum");

const findMessageService = async (messageId) => {
  try {
    const connection = new DatabaseTransaction();
    
    const message = await connection.messageRepository.getMessageById(
      messageId
    );

    if (!message) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        `Message not found`
      );
    }

    return message;
  } catch (error) {
    throw error;
  }
};

const findMessagesByRoomIdService = async (id, page, size) => {
  try {
    const connection = new DatabaseTransaction();

    const messages = await connection.messageRepository.getMessagesByRoomId(
      id,
      page,
      size
    );

    return messages;
  } catch (error) {
    throw error;
  }
};

//only message owner can update
const updateMessageService = async (userId, messageId, newMessage) => {
  try {
    const connection = new DatabaseTransaction();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "Valid user ID is required")
    }

    const user = await connection.userRepository.findUserById(userId);
    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found")
    }

    const originalMessage = await connection.messageRepository.getMessageById(
      messageId
    );
    // if (originalMessage.userId.toString() !== userId.toString()) {
    //   throw new Error("You are not the owner of this message");
    // }
    contentModeration(newMessage);

    //validate message
    validLength(1, 200, newMessage, "Update message");

    const message = await connection.messageRepository.updateMessage(
      messageId,
      newMessage
    );

    return message;
  } catch (error) {
    throw error;
  }
};

const deleteMessageService = async (userId, messageId) => {
  try {
    const connection = new DatabaseTransaction();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "Valid user ID is required")
    }

    const user = await connection.userRepository.findUserById(userId);
    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found")
    }

    const originalMessage = await connection.messageRepository.getMessageById(
      messageId
    );

    if (originalMessage.userId?.toString() !== userId?.toString()) {
      throw new Error("You are not the owner of this message");
    }

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      throw new Error("Invalid message ID");
    }

    const message = await connection.messageRepository.deleteMessage(messageId);
    return message;
  } catch (error) {
    throw error;
  }
};

const createAMessageService = async (userId, roomId, content) => {
  try {
    const connection = new DatabaseTransaction();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "Valid user ID is required")
    }

    const user = await connection.userRepository.findUserById(userId);
    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found")
    }

    contentModeration(content);
    validLength(1, 200, content, "Message");

    const response = await connection.messageRepository.createMessage({
      userId,
      roomId,
      content,
    });

    return response;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createAMessageService,
  findMessageService,
  findMessagesByRoomIdService,
  updateMessageService,
  deleteMessageService,
};
