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

        let groupParticipants = Array.from(groupParticipantIds).map(async (id) => {
          const groupParticipant = await connection.userRepository.findUserById(id);
          if (!groupParticipant) {
            throw new CoreException(StatusCodeEnums.NotFound_404, `User not found for ID: ${id}`);
          }

          return {
            userId: new mongoose.Types.ObjectId(id),
            joinedDate: new Date(),
            isAdmin: id === userId,
            assignedDate: id === userId ? new Date() : null,
          };
        });

        groupParticipants = await Promise.all(groupParticipants);

        roomData = {
          ...data,
          participants: groupParticipants,
        };

        break;

      case "member":
        const memberParticipantIds = new Set(data.participantIds || []);
        memberParticipantIds.add(userId);

        let memberParticipants = Array.from(memberParticipantIds).map(async (id) => {
          const memberParticipant = await connection.userRepository.findUserById(id);
          if (!memberParticipant) {
            throw new CoreException(StatusCodeEnums.NotFound_404, `User not found for ID: ${id}`);
          }

          return {
            userId: new mongoose.Types.ObjectId(id),
            joinedDate: new Date(),
            isAdmin: id === userId,
            assignedDate: id === userId ? new Date() : null,
          };
        });

        memberParticipants = await Promise.all(memberParticipants);

        roomData = {
          ...data,
          participants: memberParticipants,
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

const getUserRoomsService = async (userId, query) => {
  const connection = new DatabaseTransaction();

  try {
    const user = await connection.userRepository.findUserById(userId);
    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }

    const data = await connection.roomRepository.getUserRoomsRepository(userId, query);

    return data;
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

module.exports = {
  createRoomService,
  deleteRoomService,
  getUserRoomsService,
  getRoomService,
  updateRoomService,
};
