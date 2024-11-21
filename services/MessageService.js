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

    console.log(message);

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

const findMessagesByRoomIdService = async (id, page, size, content) => {
  try {
    const connection = new DatabaseTransaction();

    const messages = await connection.messageRepository.getMessagesByRoomId(
      id,
      page,
      size,
      content
    );

    return messages;
  } catch (error) {
    throw error;
  }
};

//only message owner can update
const updateMessageService = async (userId, messageId, newMessage) => {
  try {
    contentModeration(newMessage, "message");

    //validate message
    validLength(1, 200, newMessage, "Update message");

    const connection = new DatabaseTransaction();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Valid user ID is required"
      );
    }

    const user = await connection.userRepository.findUserById(userId);
    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }

    const originalMessage = await connection.messageRepository.getMessageById(
      messageId
    );
    if (!originalMessage) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Message not found"
      );
    }

    if (originalMessage.userId?.toString() !== userId?.toString()) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "Not your message"
      );
    }

    const room = await connection.roomRepository.getRoomByIdRepository(
      originalMessage.roomId
    );
    if (!room) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Message not in any room"
      );
    }

    if (room.enumMode !== "public") {
      const isParticipant = room.participants.some((participant) => {
        console.log(participant.user._id?.toString(), userId?.toString());
        if (participant.user._id?.toString() === userId?.toString()) {
          return true;
        }
      });

      if (!isParticipant) {
        throw new CoreException(
          StatusCodeEnums.Forbidden_403,
          "User is not a participant in the room"
        );
      }
    }

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
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Valid user ID is required"
      );
    }

    const user = await connection.userRepository.findUserById(userId);
    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }

    const originalMessage = await connection.messageRepository.getMessageById(
      messageId
    );

    if (originalMessage.userId?.toString() !== userId?.toString()) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "Not your message"
      );
    }

    const room = await connection.roomRepository.getRoomByIdRepository(
      originalMessage.roomId
    );
    if (!room) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Message not in any room"
      );
    }

    if (room.enumMode !== "public") {
      const isParticipant = room.participants.some((participant) => {
        console.log(participant.user._id?.toString(), userId?.toString());
        if (participant.user._id?.toString() === userId?.toString()) {
          return true;
        }
      });

      if (!isParticipant) {
        throw new CoreException(
          StatusCodeEnums.Forbidden_403,
          "User is not a participant in the room"
        );
      }
    }

    const message = await connection.messageRepository.deleteMessage(messageId);
    return message;
  } catch (error) {
    throw error;
  }
};

const createAMessageService = async (userId, roomId, content) => {
  try {
    contentModeration(content, "message");
    validLength(1, 200, content, "Message");

    const connection = new DatabaseTransaction();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Valid user ID is required"
      );
    }

    const user = await connection.userRepository.findUserById(userId);
    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }

    const room = await connection.roomRepository.getRoomByIdRepository(roomId);
    if (!room) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Room not found");
    }

    if (room.enumMode !== "public") {
      const isParticipant = room.participants.some((participant) => {
        if (participant.user._id?.toString() === userId?.toString()) {
          return true;
        }
      });

      if (!isParticipant) {
        throw new CoreException(
          StatusCodeEnums.Forbidden_403,
          "User is not a participant in the room"
        );
      }
    }

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
