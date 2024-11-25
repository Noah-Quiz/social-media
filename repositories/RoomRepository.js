const { default: mongoose } = require("mongoose");
const Room = require("../entities/RoomEntity");

class RoomRepository {
  // Create a new room
  async createRoomRepository(roomData, session) {
    try {
      const room = await Room.create([roomData], { session });

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
            isDeleted: false,
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
                                cond: {
                                  $eq: [
                                    "$$userDetail._id",
                                    "$$participant.userId",
                                  ],
                                },
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
  async getUserRoomsRepository(userId, query) {
    try {
      const page = query.page || 1;
      const size = parseInt(query.size, 10) || 10;
      const skip = (page - 1) * size;

      const searchQuery = {
        isDeleted: false,
        participants: { $elemMatch: { userId: userId } },
      };

      const totalRooms = await Room.countDocuments(searchQuery);

      const rooms = await Room.find(
        searchQuery,
        { __v: 0, isDeleted: 0 },
        {
          sort: { lastUpdated: -1 },
          skip: skip,
          limit: size,
        }
      );

      return {
        rooms,
        total: totalRooms,
        page: Number(page),
        totalPages: Math.ceil(totalRooms / Number(size)),
      };
    } catch (error) {
      throw new Error(`Error retrieving rooms: ${error.message}`);
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

  async updateRoomParticipantsRepository(roomId, participantId, isAdding) {
    try {
      const updateOperation = isAdding
        ? {
            $addToSet: {
              participants: {
                userId: new mongoose.Types.ObjectId(participantId),
                joinedDate: new Date(),
              },
            },
          }
        : {
            $pull: {
              participants: {
                userId: new mongoose.Types.ObjectId(participantId),
              },
            },
          };

      const updatedRoom = await Room.findByIdAndUpdate(
        roomId,
        updateOperation,
        {
          new: true,
          runValidators: true,
        }
      );

      return isAdding
        ? `User has been added to the room successfully`
        : `User has been removed from the room successfully`;
    } catch (error) {
      throw new Error(
        `Failed to update participants for room ${roomId}: ${error.message}`
      );
    }
  }

  async assignGroupChatAdminRepository(roomId, participantId) {
    try {
      const newAdminRoom = await Room.findOneAndUpdate(
        {
          _id: roomId,
          "participants.userId": participantId,
        },
        {
          $set: {
            "participants.$.isAdmin": true,
          },
        },
        { new: true }
      );

      return newAdminRoom;
    } catch (error) {
      throw new Error(`Error assigning group chat admin: ${error.message}`);
    }
  }

  async removeGroupChatAdminRepository(roomId, participantId) {
    try {
      const newAdminRoom = await Room.findOneAndUpdate(
        {
          _id: roomId,
          "participants.userId": participantId,
        },
        {
          $set: {
            "participants.$.isAdmin": false,
          },
        },
        { new: true }
      );

      return newAdminRoom;
    } catch (error) {
      throw new Error(`Error removing group chat admin: ${error.message}`);
    }
  }
}

module.exports = RoomRepository;
