const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const UserEnum = require("../enums/UserEnum");
const { default: mongoose } = require("mongoose");
const { checkMemberShip } = require("./VideoService");

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
        const recipient = await connection.userRepository.findUserById(
          data?.recipientId
        );
        if (!recipient) {
          throw new CoreException(
            StatusCodeEnums.NotFound_404,
            "Recipient not found"
          );
        }

        const privateRoom =
          await connection.roomRepository.getPrivateRoomByUserIds(
            userId,
            data?.recipientId
          );
        if (privateRoom) {
          throw new CoreException(
            StatusCodeEnums.Conflict_409,
            "Private room already exists between these users"
          );
        }

        roomData = {
          participants: [
            {
              userId: new mongoose.Types.ObjectId(userId),
              joinedDate: new Date(),
            },
            {
              userId: new mongoose.Types.ObjectId(data?.recipientId),
              joinedDate: new Date(),
            },
          ],
          enumMode: "private",
        };

        break;

      case "public":
        const existingPublicRoom =
          await connection.roomRepository.getRoomByEnumModeRepository(
            data.enumMode
          );
        if (existingPublicRoom?.enumMode === "public") {
          throw new CoreException(
            StatusCodeEnums.Conflict_409,
            "This room type already exists"
          );
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

        let groupParticipants = Array.from(groupParticipantIds).map(
          async (id) => {
            const groupParticipant =
              await connection.userRepository.findUserById(id);
            if (!groupParticipant) {
              throw new CoreException(
                StatusCodeEnums.NotFound_404,
                `User not found`
              );
            }

            return {
              userId: new mongoose.Types.ObjectId(id),
              joinedDate: new Date(),
              isAdmin: id === userId,
              assignedDate: id === userId ? new Date() : null,
            };
          }
        );

        groupParticipants = await Promise.all(groupParticipants);

        roomData = {
          ...data,
          participants: groupParticipants,
        };

        break;

      case "member":
        const memberParticipantIds = new Set(data.participantIds || []);
        memberParticipantIds.add(userId);

        let memberParticipants = Array.from(memberParticipantIds).map(
          async (id) => {
            const memberParticipant =
              await connection.userRepository.findUserById(id);
            if (!memberParticipant) {
              throw new CoreException(
                StatusCodeEnums.NotFound_404,
                `User not found`
              );
            }

            if (id !== userId) {
              const isMember = await checkMemberShip(id, userId);
              if (!isMember) {
                throw new CoreException(
                  StatusCodeEnums.Forbidden_403,
                  `User ${id} is not part of member group to be added`
                );
              }
            }

            return {
              userId: new mongoose.Types.ObjectId(id),
              joinedDate: new Date(),
              isAdmin: id === userId,
              assignedDate: id === userId ? new Date() : null,
            };
          }
        );

        memberParticipants = await Promise.all(memberParticipants);

        roomData = {
          ...data,
          participants: memberParticipants,
        };

        break;

      default:
        throw new CoreException(
          StatusCodeEnums.InternalServerError_500,
          "Internal Server Error"
        );
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

    if (room.enumMode !== "public") {
      const isParticipant = room.participants.some(
        (participant) => participant.user._id?.toString() === userId?.toString()
      );
      if (!isParticipant) {
        throw new CoreException(StatusCodeEnums.NotFound_404, "Room not found");
      }
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

    const data = await connection.roomRepository.getUserRoomsRepository(
      userId,
      query
    );

    return data;
  } catch (error) {
    throw error;
  }
};

const deleteRoomService = async (roomId, userId) => {
  const connection = new DatabaseTransaction();
  try {
    const user = await connection.userRepository.findUserById(userId);
    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }

    const checkRoom = await connection.roomRepository.getRoomByIdRepository(
      roomId
    );
    if (!checkRoom) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Room not found");
    }

    const isParticipant = checkRoom.participants.some(
      (participant) => participant.user._id?.toString() === userId?.toString()
    );
    if (!isParticipant) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Room not found");
    }

    switch (checkRoom?.enumMode) {
      case "private":
        throw new CoreException(
          StatusCodeEnums.MethodNotAllowed_405,
          "Private conversation cannot be deleted"
        );

      case "public":
        if (user?.role !== UserEnum.ADMIN) {
          throw new CoreException(
            StatusCodeEnums.Forbidden_403,
            "You do not have permission to perform this action"
          );
        }
        break;

      case "group":
        const isGroupAdmin = checkRoom.participants.some(
          (participant) =>
            userId?.toString() === participant.user._id?.toString() &&
            participant.isAdmin
        );

        if (!isGroupAdmin) {
          throw new CoreException(
            StatusCodeEnums.Forbidden_403,
            "You do not have permission to perform this action"
          );
        }

        break;

      case "member":
        const isMemberAdmin = checkRoom.participants.some(
          (participant) =>
            userId?.toString() === participant.user._id?.toString() &&
            participant.isAdmin
        );

        if (!isMemberAdmin) {
          throw new CoreException(
            StatusCodeEnums.Forbidden_403,
            "You do not have permission to perform this action"
          );
        }

        break;

      default:
        throw new CoreException(
          StatusCodeEnums.InternalServerError_500,
          "Internal Server Error"
        );
    }

    const room = await connection.roomRepository.deleteRoomByIdRepository(
      roomId
    );

    return room;
  } catch (error) {
    throw error;
  }
};

const updateRoomService = async (roomId, userId, roomData) => {
  const connection = new DatabaseTransaction();
  try {
    const user = await connection.userRepository.getAnUserByIdRepository(
      userId
    );
    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }

    const checkRoom = await connection.roomRepository.getRoomByIdRepository(
      roomId
    );
    if (!checkRoom) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Room not found");
    }

    if (checkRoom?.enumMode !== "public") {
      const isParticipant = checkRoom.participants.some(
        (participant) => participant.user._id?.toString() === userId?.toString()
      );
      if (!isParticipant) {
        throw new CoreException(StatusCodeEnums.NotFound_404, "Room not found");
      }
    }

    switch (checkRoom?.enumMode) {
      case "private":
        throw new CoreException(
          StatusCodeEnums.MethodNotAllowed_405,
          "Private conversation cannot be updated"
        );

      case "public":
        if (user?.role !== UserEnum.ADMIN) {
          throw new CoreException(
            StatusCodeEnums.Forbidden_403,
            "You do not have permission to perform this action"
          );
        }
        break;

      case "group":
        const isGroupAdmin = checkRoom.participants.some(
          (participant) =>
            userId?.toString() === participant.user._id?.toString() &&
            participant.isAdmin
        );

        if (!isGroupAdmin) {
          throw new CoreException(
            StatusCodeEnums.Forbidden_403,
            "You do not have permission to perform this action"
          );
        }

        break;

      case "member":
        const isMemberAdmin = checkRoom.participants.some(
          (participant) =>
            userId?.toString() === participant.user._id?.toString() &&
            participant.isAdmin
        );

        if (!isMemberAdmin) {
          throw new CoreException(
            StatusCodeEnums.Forbidden_403,
            "You do not have permission to perform this action"
          );
        }

        break;

      default:
        throw new CoreException(
          StatusCodeEnums.InternalServerError_500,
          "Internal Server Error"
        );
    }

    if (roomData.avatar !== null) {
      roomData.avatar = `${process.env.APP_BASE_URL}/${roomData.avatar}`;
    } else {
      delete roomData.avatar;
    }

    const room = await connection.roomRepository.updateRoomByIdRepository(
      roomId,
      roomData
    );

    return room;
  } catch (error) {
    throw error;
  }
};

const addRoomParticipantService = async (roomId, userId, participantId) => {
  const connection = new DatabaseTransaction();
  try {
    const user = await connection.userRepository.findUserById(userId);
    if (!user) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        `User not found`
      );
    }

    const participant = await connection.userRepository.findUserById(
      participantId
    );
    if (!participant) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        `User not found`
      );
    }

    const room = await connection.roomRepository.getRoomByIdRepository(roomId);
    if (!room) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Room not found");
    }

    const isGroupOrMemberAdmin = room.participants.some(
      (participant) =>
        userId?.toString() === participant.user._id?.toString() &&
        participant.isAdmin
    );
    if (!isGroupOrMemberAdmin) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You do not have permission to perform this action"
      );
    }

    const isParticipant = room.participants.some(
      (participant) =>
        participant.user._id?.toString() === participantId?.toString()
    );
    if (isParticipant) {
      throw new CoreException(
        StatusCodeEnums.Conflict_409,
        "User is already in room"
      );
    }

    await connection.roomRepository.updateRoomParticipantsRepository(
      roomId,
      participantId,
      true
    ); // true means adding

    return;
  } catch (error) {
    throw error;
  }
};

const removeRoomParticipantService = async (roomId, userId, participantId) => {
  const connection = new DatabaseTransaction();
  try {
    const user = await connection.userRepository.findUserById(userId);
    if (!user) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        `User not found`
      );
    }

    const participant = await connection.userRepository.findUserById(
      participantId
    );
    if (!participant) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        `User not found`
      );
    }

    const room = await connection.roomRepository.getRoomByIdRepository(roomId);
    if (!room) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Room not found");
    }

    const isGroupOrMemberAdmin = room.participants.some(
      (participant) =>
        userId?.toString() === participant.user._id?.toString() &&
        participant.isAdmin
    );
    if (!isGroupOrMemberAdmin) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You do not have permission to perform this action"
      );
    }

    const isParticipant = room.participants.some(
      (participant) =>
        participant.user._id?.toString() === participantId?.toString()
    );
    if (!isParticipant) {
      throw new CoreException(
        StatusCodeEnums.Conflict_409,
        "User not found in room"
      );
    }

    await connection.roomRepository.updateRoomParticipantsRepository(
      roomId,
      participantId,
      false
    ); // false means removing

    return;
  } catch (error) {
    throw error;
  }
};

const assignGroupChatAdminService = async (roomId, userId, participantId) => {
  const connection = new DatabaseTransaction();
  try {
    const user = await connection.userRepository.findUserById(userId);
    if (!user) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        `User not found`
      );
    }

    const participant = await connection.userRepository.findUserById(
      participantId
    );
    if (!participant) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        `User not found for`
      );
    }

    if (userId === participantId) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You cannot assign yourself as group chat admin"
      );
    }

    const room = await connection.roomRepository.getRoomByIdRepository(roomId);
    if (!room) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Room not found");
    }
    if (room.enumMode !== "group") {
      throw new CoreException(
        StatusCodeEnums.Conflict_409,
        "This action is only allowed for group chat"
      );
    }

    const isGroupAdmin = room.participants.some(
      (participant) =>
        userId?.toString() === participant.user._id?.toString() &&
        participant.isAdmin
    );
    if (!isGroupAdmin) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You do not have permission to perform this action"
      );
    }

    const isParticipant = room.participants.some(
      (participant) =>
        participant.user._id?.toString() === participantId?.toString()
    );
    if (!isParticipant) {
      throw new CoreException(
        StatusCodeEnums.Conflict_409,
        "User not found in room"
      );
    }

    const isAlreadyAdmin = room.participants.some(
      (participant) =>
        participant.user._id?.toString() === participantId?.toString() &&
        participant.isAdmin
    );
    if (isAlreadyAdmin) {
      throw new CoreException(
        StatusCodeEnums.Conflict_409,
        "User is already an admin"
      );
    }

    await connection.roomRepository.assignGroupChatAdminRepository(
      roomId,
      participantId
    );

    return;
  } catch (error) {
    throw error;
  }
};

const removeGroupChatAdminService = async (roomId, userId, participantId) => {
  const connection = new DatabaseTransaction();
  try {
    const user = await connection.userRepository.findUserById(userId);
    if (!user) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        `User not found`
      );
    }

    const participant = await connection.userRepository.findUserById(
      participantId
    );
    if (!participant) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        `User not found`
      );
    }

    if (userId === participantId) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You cannot remove yourself as group chat admin"
      );
    }

    const room = await connection.roomRepository.getRoomByIdRepository(roomId);
    if (!room) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Room not found");
    }
    if (room.enumMode !== "group") {
      throw new CoreException(
        StatusCodeEnums.Conflict_409,
        "This action is only allowed for group chat"
      );
    }

    const isGroupAdmin = room.participants.some(
      (participant) =>
        userId?.toString() === participant.user._id?.toString() &&
        participant.isAdmin
    );
    if (!isGroupAdmin) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You do not have permission to perform this action"
      );
    }

    const isParticipant = room.participants.some(
      (participant) =>
        participant.user._id?.toString() === participantId?.toString()
    );
    if (!isParticipant) {
      throw new CoreException(
        StatusCodeEnums.Conflict_409,
        "User not found in room"
      );
    }

    const isAlreadyAdmin = room.participants.some(
      (participant) =>
        participant.user._id?.toString() === participantId?.toString() &&
        participant.isAdmin
    );
    if (!isAlreadyAdmin) {
      throw new CoreException(
        StatusCodeEnums.Conflict_409,
        "User is not an admin"
      );
    }

    await connection.roomRepository.removeGroupChatAdminRepository(
      roomId,
      participantId
    );

    return;
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
  addRoomParticipantService,
  removeRoomParticipantService,
  assignGroupChatAdminService,
  removeGroupChatAdminService,
};
