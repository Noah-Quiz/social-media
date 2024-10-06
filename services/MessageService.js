const mongoose = require("mongoose");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");

const findMessage = async (messageId) => {
  try {
    const connection = new DatabaseTransaction();
    const message = await connection.MessageRepository.getMessageById(
      messageId
    );
    return message;
  } catch (error) {
    throw new Error(error.message);
  }
};

const findAllMessagesByRoomId = async (id) => {
  try {
    const connection = new DatabaseTransaction();

    const messages = await connection.MessageRepository.getAllMessagesByRoomId(
      id
    );

    return messages;
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateMessageService = async (messageId, updateData) => {
  try {
    const connection = new DatabaseTransaction();

    const message = await connection.MessageRepository.updateMessage(
      messageId,
      updateData
    );

    return message;
  } catch (error) {
    throw new Error(error.message);
  }
};

const deleteMessageService = async (messageId) => {
  try {
    const connection = new DatabaseTransaction();
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      console.log("ko valid");
    }
    const message = await connection.MessageRepository.deleteMessage(messageId);
    return message;
  } catch (error) {
    throw new Error(error.message);
  }
};

const createAMessageService = async (userId, roomId, content) => {
  try {
    const connection = new DatabaseTransaction();
    const response = await connection.MessageRepository.createMessage({
      userId,
      roomId,
      content,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createAMessageService,
  findMessage,
  findAllMessagesByRoomId,
  updateMessageService,
  deleteMessageService,
};
