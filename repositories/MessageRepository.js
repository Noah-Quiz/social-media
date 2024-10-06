const Message = require("../entities/MessageEntity");

class MessageRepository {
  async createMessage(data, session) {
    console.log(data);
    try {
      const message = await Message.create([data], { session });
      return message[0];
    } catch (error) {
      throw new Error(`Error creating message: ${error.message}`);
    }
  }

  async getMessageById(messageId) {
    try {
      const message = await Message.findOne({
        _id: messageId,
        isDeleted: false,
      });

      if (!message) {
        throw new Error("Message not found");
      }
      return message;
    } catch (error) {
      throw new Error(`Error finding message: ${error.message}`);
    }
  }

  async updateMessage(messageId, updateData, session) {
    updateData.lastUpdated = new Date();
    try {
      const message = await Message.findByIdAndUpdate(messageId, updateData, {
        new: true,
        runValidators: true,
        session,
      });

      if (!message) {
        throw new Error("Message not found");
      }

      return message;
    } catch (error) {
      throw new Error(`Error updating message: ${error.message}`);
    }
  }

  // Delete a message by ID
  async deleteMessage(messageId, session) {
    try {
      const message = await Message.findByIdAndUpdate(
        { _id: messageId },
        { isDeleted: true, lastUpdated: new Date() },
        { new: true, runValidators: true, session }
      );

      if (!message) {
        throw new Error("Message not found");
      }

      return message;
    } catch (error) {
      throw new Error(`Error deleting message: ${error.message}`);
    }
  }

  async getAllMessagesByRoomId(id) {
    try {
      const messages = await Message.find({ roomId: id, isDeleted: false });

      return messages;
    } catch (error) {
      throw new Error(`Error fetching messages: ${error.message}`);
    }
  }
}

module.exports = MessageRepository;
