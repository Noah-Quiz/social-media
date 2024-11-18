const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");

const createRoomService = async (roomData) => {
  const connection = new DatabaseTransaction();
  try {
    const checkRoom = await connection.roomRepository.getRoomByEnumModeRepository(roomData.enumMode)
    if (checkRoom?.enumMode === "public") {
      throw new CoreException(StatusCodeEnums.Conflict_409, "This room type already exist");
    }

    const room = await connection.roomRepository.createRoomRepository(roomData);

    return room;
  } catch (error) {
    throw error;
  }
};

const getRoomService = async (roomId) => {
  const connection = new DatabaseTransaction();
  try {
    const room = await connection.roomRepository.getRoomByIdRepository(roomId);
    if (!room) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Room not found");
    }

    return room;
  } catch (error) {
    throw error;
  }
};

const getAllRoomsService = async () => {
  const connection = new DatabaseTransaction();
  try {
    const rooms = await connection.roomRepository.getAllRooms();
    return rooms;
  } catch (error) {
    throw error;
  }
};

const deleteRoomService = async (roomId) => {
  const connection = new DatabaseTransaction();
  try {
    const checkRoom = await connection.roomRepository.getRoomByIdRepository(roomId);
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
  getAllRoomsService,
  getRoomService,
  updateRoomService,
  DirectMessageService,
  getRoomUserIdService,
  getRoomVideoIdService,
  getGlobalRoomService,
  handleMemberGroupChatService,
};
