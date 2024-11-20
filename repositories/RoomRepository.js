const { default: mongoose } = require("mongoose");
const Room = require("../entities/RoomEntity");

class RoomRepository {
  // Create a new room
  async createRoomRepository(roomData, session) {
    try {
      const room = await Room.create([roomData], { session })

      return room[0];
    } catch (error) {
      throw new Error(`Error creating room: ${error.message}`);
    }
  }

  async getRoomByEnumModeRepository(enumMode) {
    try {
      const rooms = await Room.findOne({ 
        enumMode,
        isDeleted: false,
      });

      return rooms;
    } catch (error) {
      throw new Error(`Error retrieving room: ${error.message}`);
    }
  }

  async getPrivateRoomByUserIds(userId, recipientId) {
    try {
      const room = await Room.findOne({
        enumMode: "private",
        participants: {
          $elemMatch: {
            userId: { $in: [userId, recipientId] },
          },
        },
      });
  
      return room || null;
    } catch (error) {
      throw new Error(`Error retrieving private room: ${error.message}`);
    }
  }  
  
  // Get a room by its ID
  async getRoomByIdRepository(roomId) {
    try {
      const room = await Room.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(roomId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "participants.userId",
            foreignField: "_id",
            as: "participantDetails",
          },
        },
        {
          $addFields: {
            participants: {
              $map: {
                input: "$participants",
                as: "participant",
                in: {
                  user: {
                    $let: {
                      vars: {
                        userDetail: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$participantDetails",
                                as: "userDetail",
                                cond: { $eq: ["$$userDetail._id", "$$participant.userId"] },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: {
                        _id: "$$userDetail._id",
                        fullName: "$$userDetail.fullName",
                        nickName: "$$userDetail.nickName",
                        avatar: "$$userDetail.avatar",
                      },
                    },
                  },
                  joinedDate: "$$participant.joinedDate",
                  isAdmin: "$$participant.isAdmin",
                  assignedDate: "$$participant.assignedDate",
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "messages",
            localField: "_id",
            foreignField: "roomId",
            as: "messages",
          },
        },
        {
          $addFields: {
            messagesCount: { $size: "$messages" },
          },
        },
        {
          $project: {
            messages: 0,
            participantDetails: 0,
            isDeleted: 0,
            __v: 0,
          },
        },
      ]);
  
      return room[0];
    } catch (error) {
      throw new Error(
        `Error retrieving room with ID ${roomId}: ${error.message}`
      );
    }
  }
   

  // Update room by ID
  async updateRoomByIdRepository(roomId, updateData) {
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
  async deleteRoomByIdRepository(roomId) {
    try {
      const deletedRoom = await Room.findByIdAndUpdate(
        roomId,
        {
          $set: { isDeleted: true, lastUpdated: Date.now() },
        },
        { new: true }
      );
      
      return deletedRoom;
    } catch (error) {
      throw new Error(
        `Error deleting room with ID ${roomId}: ${error.message}`
      );
    }
  }

  // Get all rooms (non-deleted only)
  async getUserRoomsRepository(userId) {
    try {
      return await Room.find({ 
        isDeleted: false,
        participants: { $elemMatch: { userId: userId } },
      },
      { __v: 0, isDeleted: 0 }
    );

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
      }).populate({
        path: "participants",
        select:
          "fullName nickName role avatar email phoneNumber follow followBy _id",
      });
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
      }).populate({
        path: "participants",
        select:
          "fullName nickName role avatar email phoneNumber follow followBy _id",
      });
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
