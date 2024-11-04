const mongoose = require("mongoose");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const { contentModeration } = require("../utils/validator");

const findMessageService = async (messageId) => {
  try {
    const connection = new DatabaseTransaction();
    const message = await connection.messageRepository.getMessageById(
      messageId
    );
    return message;
  } catch (error) {
    throw new Error(error.message);
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
    throw new Error(error.message);
  }
};

//only message owner can update
const updateMessageService = async (userId, messageId, updateData) => {
  try {
    const connection = new DatabaseTransaction();
    const originalMessage = await connection.messageRepository.getMessageById(
      messageId
    );
    if (originalMessage.userId.toString() !== userId.toString()) {
      throw new Error("You are not the owner of this message");
    }
    const message = await connection.messageRepository.updateMessage(
      messageId,
      updateData
    );

    return message;
  } catch (error) {
    throw new Error(error.message);
  }
};

const deleteMessageService = async (userId, messageId) => {
  try {
    const connection = new DatabaseTransaction();
    const originalMessage = await connection.messageRepository.getMessageById(
      messageId
    );
    if (originalMessage.userId.toString() !== userId.toString()) {
      throw new Error("You are not the owner of this message");
    }
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      console.log("ko valid");
    }
    const message = await connection.messageRepository.deleteMessage(messageId);
    return message;
  } catch (error) {
    throw new Error(error.message);
  }
};

const createAMessageService = async (userId, roomId, content) => {
  try {
    const connection = new DatabaseTransaction();
    console.log("đã tới đây");
    contentModeration(content);
    console.log("đã tới đây 1");
    const response = await connection.messageRepository.createMessage({
      userId,
      roomId,
      content,
    });
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createAMessageService,
  findMessageService,
  findMessagesByRoomIdService,
  updateMessageService,
  deleteMessageService,
};
