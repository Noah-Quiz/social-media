const DatabaseTransaction = require("../repositories/DatabaseTransaction");

const createRoomService = async (roomData) => {
  const connection = new DatabaseTransaction();
  try {
    const room = await connection.roomRepository.createRoom(roomData);
    return room;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getRoomService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const room = await connection.roomRepository.getRoomById(id);
    return room;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllRoomsService = async () => {
  const connection = new DatabaseTransaction();
  try {
    const rooms = await connection.roomRepository.getAllRooms();
    return rooms;
  } catch (error) {
    throw new Error(error.message);
  }
};

const deleteRoomService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const room = await connection.roomRepository.deleteRoomById(id);
    return room;
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateRoomService = async (id, roomData) => {
  const connection = new DatabaseTransaction();
  try {
    const room = await connection.roomRepository.updateRoomById(id, roomData);
    return room;
  } catch (error) {
    throw new Error(error.message);
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
        name: `Direct message with ${user.fullName || user.nickName}`,
        type: "private",
        participants: participants,
      };
      const room = await createRoom(roomData);
      return room;
    }
    return existingRoom;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getRoomUserIdService = async (userId) => {
  const connection = new DatabaseTransaction();
  try {
    const rooms = await connection.roomRepository.findChatRoomUserId(userId);
    return rooms;
  } catch (error) {
    throw new Error(error.message);
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
        type: "video",
        videoId: videoId,
      };
      const room = await createRoom(videoRoom);
      return room;
    }
    return existingRoom;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getGlobalRoomService = async () => {
  const connection = new DatabaseTransaction();
  try {
    const existingRoom = await connection.roomRepository.findPublicChatRoom();
    if (!existingRoom) {
      const globalRoom = {
        name: "Global Chat Room",
        type: "public",
      };
      const room = await createRoom(globalRoom);
      return room;
    }
    return existingRoom;
  } catch (error) {
    throw new Error(error.message);
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
};
