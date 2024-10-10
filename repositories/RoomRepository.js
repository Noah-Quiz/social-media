const Room = require("../entities/RoomEntity");

class RoomRepository {
  // Create a new room
  async createRoom(roomData) {
    try {
      const room = new Room(roomData);
      return await room.save();
    } catch (error) {
      throw new Error(`Error creating room: ${error.message}`);
    }
  }

  // Get a room by its ID
  async getRoomById(roomId) {
    try {
      return await Room.findById(roomId).populate("videoId");
    } catch (error) {
      throw new Error(
        `Error retrieving room with ID ${roomId}: ${error.message}`
      );
    }
  }

  // Update room by ID
  async updateRoomById(roomId, updateData) {
    try {
      return await Room.findByIdAndUpdate(roomId, updateData, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      throw new Error(
        `Error updating room with ID ${roomId}: ${error.message}`
      );
    }
  }

  // Soft delete a room by setting isDeleted to true
  async deleteRoomById(roomId) {
    try {
      const deletedRoom = await Room.findByIdAndUpdate(
        roomId,
        {
          $set: { isDeleted: true, lastUpdated: Date.now() }, // Soft delete with timestamp
        },
        { new: true }
      );
      if (!deletedRoom) {
        throw new Error(`Room with ID ${roomId} not found`);
      }
      return deletedRoom;
    } catch (error) {
      throw new Error(
        `Error deleting room with ID ${roomId}: ${error.message}`
      );
    }
  }

  // Get all rooms (non-deleted only)
  async getAllRooms() {
    try {
      return await Room.find({ isDeleted: false }); // Only fetch non-deleted rooms
    } catch (error) {
      throw new Error(`Error retrieving rooms: ${error.message}`);
    }
  }

  //find room for DirectMessage
  async findDMRoom(user1, user2) {
    try {
      return await Room.findOne({
        type: "private",
        participants: { $all: [user1, user2] }, // Check for rooms with both users as participants
        isDeleted: false,
      }).populate("participants");
    } catch (error) {
      throw new Error(`Error finding DM room between users: ${error.message}`);
    }
  }

  //find room for userId
  async findChatRoomUserId(userId) {
    try {
      return await Room.find({
        participants: userId,
        isDeleted: false,
      }).populate("participants");
    } catch (error) {
      throw new Error(
        `Error finding chat room for user with ID ${userId}: ${error.message}`
      );
    }
  }

  //find room for videoId
  async findChatRoomVideoId(videoId) {
    try {
      return await Room.findOne({
        videoId: videoId,
        isDeleted: false,
      }).populate("videoId");
    } catch (error) {
      throw new Error(
        `Error finding chat room for video with ID ${videoId}: ${error.message}`
      );
    }
  }
  async findPublicChatRoom() {
    try {
      const existingRoom = await Room.findOne({
        type: "public",
        isDeleted: false,
      });

      return existingRoom;
    } catch (error) {
      throw new Error(`Error finding public chat room: ${error.message}`);
    }
  }

  async handleMemberGroupChatRepository(roomId, memberId, action) {
    try {
      let updateQuery;

      if (action === "DELETE") {
        updateQuery = { $pull: { participants: memberId } };
      } else if (action === "ADD") {
        updateQuery = { $addToSet: { participants: memberId } };
      } else {
        throw new Error("Invalid action. Only 'ADD' and 'DELETE' are allowed.");
      }

      // Update the room document
      const room = await Room.findByIdAndUpdate(roomId, updateQuery, {
        new: true,
      });

      if (!room) {
        throw new Error(`Room with id ${roomId} not found.`);
      }

      return room;
    } catch (error) {
      throw new Error(
        `Error handling members for room ${roomId}: ${error.message}`
      );
    }
  }
}

module.exports = RoomRepository;
