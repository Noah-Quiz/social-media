const CreateRoomDto = require("../dtos/Room/CreateRoomDto");
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
} = require("../services/RoomService");

const mongoose = require("mongoose");

class RoomController {

  // Direct Message Room
  async DirectMessageController(req, res, next) {
    const currentUserId = req.userId;
    const targetedUserId = req.params.targetedUserId;
    try {
      const directMessageRoom = await DirectMessageService(
        currentUserId,
        targetedUserId
      );
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ data: directMessageRoom, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  // Create a Room
  async createRoomController(req, res, next) {
    const { name, enumMode } = req.body;
    let avatar = req.file ? req.file.path : null;
    if (enumMode === "private") {
      avatar = null;
    }

    try {
      const createRoomDto = new CreateRoomDto(name, enumMode);
      await createRoomDto.validate();

      const data = { name, enumMode, avatar };

      const room = await createRoomService(data);

      if (enumMode !== "private") {
        if (req.file) {
          await checkFileSuccess(avatar);
        }
      }

      return res
        .status(StatusCodeEnums.Created_201)
        .json({ room, message: "Success" });
    } catch (error) {
      if (enumMode !== "private") {
        if (req.file) {
          await deleteFile(req.file.path);
        }
      }
      next(error);
    }
  }

  // Get a Specific Room by ID
  async getRoomController(req, res, next) {
    const { roomId } = req.params;

    try {
      const room = await getRoomService(roomId);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ room, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  // Get all rooms
  async GetAllRoomsController(req, res, next) {
    try {
      const rooms = await getAllRoomsService();
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ data: rooms, message: "Success" });
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

    try {
      await deleteRoomService(roomId);

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
