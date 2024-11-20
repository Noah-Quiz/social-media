const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const UserEnum = require("../enums/UserEnum");
const { default: mongoose } = require("mongoose");

const createRoomService = async (userId, data) => {
  const connection = new DatabaseTransaction();
  try {
    let roomData = {};

    const user = await connection.userRepository.findUserById(userId);
    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }

    switch (data?.enumMode) {
      case "private":
        const recipient = await connection.userRepository.findUserById(data?.recipientId);
        if (!recipient) {
          throw new CoreException(StatusCodeEnums.NotFound_404, "Recipient not found");
        }

        const privateRoom = await connection.roomRepository.getPrivateRoomByUserIds(userId, data?.recipientId);
        if (privateRoom) {
          throw new CoreException(StatusCodeEnums.Conflict_409, "Private room already exists between these users");
        }

        roomData = {
          participants: [
            { userId: new mongoose.Types.ObjectId(userId), joinedDate: new Date() },
            { userId: new mongoose.Types.ObjectId(data?.recipientId), joinedDate: new Date() },
          ],
          enumMode: "private",
        };

        break;

      case "public":
        const existingPublicRoom = await connection.roomRepository.getRoomByEnumModeRepository(data.enumMode);
        if (existingPublicRoom?.enumMode === "public") {
          throw new CoreException(StatusCodeEnums.Conflict_409, "This room type already exists");
        }

        roomData = {
          ...data,
          participants: [
            {
              userId: new mongoose.Types.ObjectId(userId),
              joinedDate: new Date(),
              isAdmin: true,
              assignedDate: new Date(),
            },
          ],
        };

        break;

        case "group":
          const groupParticipantIds = new Set(data.participantIds || []);
          groupParticipantIds.add(userId);
      
          // Check if all IDs are valid before creating ObjectIds
          const participants = Array.from(groupParticipantIds).map((id) => {
              return {
                  userId: new mongoose.Types.ObjectId(id),
                  joinedDate: new Date(),
                  isAdmin: id === userId,
                  assignedDate: id === userId ? new Date() : null,
              };
          });
      
          roomData = {
              ...data,
              participants,
          };
      
          break;
      

      case "member":
        const memberParticipantIds = new Set(data.participantIds || []);
        memberParticipantIds.add(userId);

        roomData = {
          ...data,
          participants: Array.from(memberParticipantIds).map((id) => ({
            userId: new mongoose.Types.ObjectId(id),
            joinedDate: new Date(),
            isAdmin: id === userId,
            assignedDate: id === userId ? new Date() : null,
          })),
        };

        break;

      default:
        throw new CoreException(StatusCodeEnums.BadRequest_400, "Invalid room type");
    }

    const room = await connection.roomRepository.createRoomRepository(roomData);

    return room;
  } catch (error) {
    throw error;
  }
};

const getRoomService = async (userId, roomId) => {
  const connection = new DatabaseTransaction();
  try {
    const user = await connection.userRepository.findUserById(userId);
    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }

    const room = await connection.roomRepository.getRoomByIdRepository(roomId);
    if (!room) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Room not found");
    }
    const isParticipant = room.participants.some(
      (participant) => participant.user._id?.toString() === userId?.toString()
    );

    if (!isParticipant) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Room not found");
    }

    return room;
  } catch (error) {
    throw error;
  }
};

const getUserRoomsService = async (userId) => {
  const connection = new DatabaseTransaction();

  try {
    const user = await connection.userRepository.findUserById(userId);
    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }

    const rooms = await connection.roomRepository.getUserRoomsRepository(userId);

    return rooms;
  } catch (error) {
    throw error;
  }
};

const deleteRoomService = async (roomId, userId) => {
  const connection = new DatabaseTransaction();
  try {
    const checkRoom = await connection.roomRepository.getRoomByIdRepository(roomId);
    if (!checkRoom) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Room not found")
    }

    const isParticipant = checkRoom.participants.some(
      (participant) => participant.user._id?.toString() === userId?.toString()
    );
    if (!isParticipant) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Room not found");
    }

    if (checkRoom?.enumMode === "private") {
      throw new CoreException(StatusCodeEnums.MethodNotAllowed_405, "Private conversation cannot be deleted")
    }

    const room = await connection.roomRepository.deleteRoomByIdRepository(roomId);

    return room;
  } catch (error) {
    throw error;
  }
};

const updateRoomService = async (id, roomData) => {
  const connection = new DatabaseTransaction();
  try {
    const room = await connection.roomRepository.updateRoomByIdRepository(id, roomData);
    return room;
  } catch (error) {
    throw error;
  }
};

const DirectMessageService = async (userIdA, userIdB) => {
  const connection = new DatabaseTransaction();
  try {
    const user = await connection.userRepository.getAnUserByIdRepository(
      userIdB
    );
    const existingRoom = await connection.roomRepository.findDMRoom(
      userIdA,
      userIdB
    );

    if (!existingRoom) {
      const participants = [userIdA, userIdB];
      const roomData = {
        enumMode: "private",
        participants: participants,
      };
      const room = await connection.roomRepository.createRoom(roomData);
      return room;
    }
    return existingRoom;
  } catch (error) {
    throw error;
  }
};

const getRoomUserIdService = async (userId) => {
  const connection = new DatabaseTransaction();
  try {
    const rooms = await connection.roomRepository.findChatRoomUserId(userId);
    return rooms;
  } catch (error) {
    throw error;
  }
};

const getRoomVideoIdService = async (videoId) => {
  const connection = new DatabaseTransaction();
  try {
    const video = await connection.videoRepository.getVideoRepository(videoId);
    if (!video) {
      throw new Error("No video found");
    }
    const existingRoom = await connection.roomRepository.findChatRoomVideoId(
      videoId
    );
    if (!existingRoom) {
      const videoRoom = {
        name: `${video.title}'S CHAT ROOM`,
        enumMode: "video",
        videoId: videoId,
      };
      const room = await createRoom(videoRoom);
      return room;
    }
    return existingRoom;
  } catch (error) {
    throw error;
  }
};

const getGlobalRoomService = async () => {
  const connection = new DatabaseTransaction();
  try {
    const existingRoom = await connection.roomRepository.findPublicChatRoom();
    if (!existingRoom) {
      const globalRoom = {
        name: "Global Chat Room",
        enumMode: "public",
      };
      const room = await createRoom(globalRoom);
      return room;
    }
    return existingRoom;
  } catch (error) {
    throw error;
  }
};

const handleMemberGroupChatService = async (roomId, memberId, action) => {
  const connection = new DatabaseTransaction();
  try {
    const room =
      await connection.roomRepository.handleMemberGroupChatRepository(
        roomId,
        memberId,
        action
      );
    return room;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createRoomService,
  deleteRoomService,
  getUserRoomsService,
  getRoomService,
  updateRoomService,
  DirectMessageService,
  getRoomUserIdService,
  getRoomVideoIdService,
  getGlobalRoomService,
  handleMemberGroupChatService,
};
