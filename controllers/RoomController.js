const CreateGroupRoomDto = require("../dtos/Room/CreateGroupRoomDto");
const CreatePrivateRoomDto = require("../dtos/Room/CreatePrivateRoomDto");
const GetRoomDto = require("../dtos/Room/GetRoomDto");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const { checkFileSuccess, deleteFile } = require("../middlewares/storeFile");
const {
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
  getUserRoomsService,
} = require("../services/RoomService");

const mongoose = require("mongoose");

class RoomController {

  // Create a Room
  async createPublicRoomController(req, res, next) {
    const { name } = req.body;
    const userId = req.userId;

    try {
      const data = { name, enumMode: "public" };

      const room = await createRoomService(userId, data);

      return res
        .status(StatusCodeEnums.Created_201)
        .json({ room, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  // Create a Room
  async createPrivateRoomController(req, res, next) {
    const { recipientId } = req.body;
    const userId = req.userId;

    try {
      const createPrivateRoomDto = new CreatePrivateRoomDto(userId, recipientId);
      await createPrivateRoomDto.validate();

      const data = { enumMode: "private", recipientId };

      const room = await createRoomService(userId, data);

      return res
        .status(StatusCodeEnums.Created_201)
        .json({ room, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  // Create a group Room
  async createGroupRoomController(req, res, next) {
    const { name } = req.body;
    let { participantIds } = req.body;
    const userId = req.userId;
    let avatar = req.file ? req.file.path : null;
    
    if (typeof participantIds === "string") {
      if (participantIds.includes(",")) {
        participantIds = participantIds.split(",").map((id) => id.trim());
      } else {
        participantIds = [participantIds.trim()];
      }
    }

    try {
      const createGroupRoomDto = new CreateGroupRoomDto(name, participantIds);
      await createGroupRoomDto.validate();

      const data = { name, enumMode: "group", avatar, participantIds };

      const room = await createRoomService(userId, data);

      if (req.file) {
        await checkFileSuccess(avatar);
      }

      return res
        .status(StatusCodeEnums.Created_201)
        .json({ room, message: "Success" });
    } catch (error) {
      if (req.file) {
        await deleteFile(req.file.path);
      }
      next(error);
    }
  }

  // Create a Room
  async createMemberRoomController(req, res, next) {
    const { name, participantIds } = req.body;
    const userId = req.userId;
    let avatar = req.file ? req.file.path : null;

    if (typeof participantIds === "string") {
      if (participantIds.includes(",")) {
        participantIds = participantIds.split(",").map((id) => id.trim());
      } else {
        participantIds = [participantIds.trim()];
      }
    }

    try {
      const createGroupRoomDto = new CreateGroupRoomDto(name, participantIds);
      await createGroupRoomDto.validate();

      const data = { name, enumMode: "member", avatar, participantIds };

      const room = await createRoomService(userId, data);

      if (req.file) {
        await checkFileSuccess(avatar);
      }

      return res
        .status(StatusCodeEnums.Created_201)
        .json({ room, message: "Success" });
    } catch (error) {
      if (req.file) {
        await deleteFile(req.file.path);
      }
      next(error);
    }
  }

  // Get a Specific Room by ID
  async getRoomController(req, res, next) {
    const { roomId } = req.params;
    const userId = req.userId;

    try {
      const getRoomDto = new GetRoomDto(roomId);
      await getRoomDto.validate();

      const room = await getRoomService(userId, roomId);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ room, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  // Get all rooms
  async getUserRoomsController(req, res, next) {
    const userId = req.userId;

    try {
      const rooms = await getUserRoomsService(userId);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ rooms, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  // Update a Room by ID
  async updateRoomController(req, res, next) {
    const { roomId } = req.params;
    let avatar = req.file ? req.file.path : null;
    const { name } = req.body;

    try {
      const roomData = { name, avatar }
      const room = await updateRoomService(roomId, roomData);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ room, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  // Delete a Room by ID (Soft Delete)
  async deleteRoomController(req, res, next) {
    const { roomId } = req.params;
    const userId = req.userId;

    try {
      await deleteRoomService(roomId, userId);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  //9. Get all direct message by userID
  async UserChatRoomsController(req, res, next) {
    const userId = req.userId;
    try {
      const rooms = await getRoomUserIdService(userId);
      res
        .status(StatusCodeEnums.OK_200)
        .json({ data: rooms, size: rooms.length, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async handleMemberGroupChatController(req, res, next) {
    const { roomId, memberId, action } = req.body;
    const room = await getRoom(roomId);
    console.log(room);
    if (
      !mongoose.Types.ObjectId.isValid(roomId) ||
      !mongoose.Types.ObjectId.isValid(memberId)
    ) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "Invalid ID");
    }
    if (room.type !== "group") {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "This is not a group chat"
      );
    }
    try {
      const result = await handleMemberGroupChatService(
        roomId,
        memberId,
        action
      );
      res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Success", data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RoomController;
