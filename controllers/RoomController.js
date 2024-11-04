const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
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
  // 1. Global Chat Room
  async GlobalChatController(req, res, next) {
    try {
      const globalRoom = await getGlobalRoomService();
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ data: globalRoom, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  // 2. Direct Message Room
  async DirectMessageController(req, res, next) {
    const currentUserId = req.userId;
    const targetedUserId = req.query.userId;
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

  // 3. Video Chat Room
  async VideoChatController(req, res, next) {
    const videoId = req.query.videoId;
    try {
      const roomVideoId = await getRoomVideoIdService(videoId);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ data: roomVideoId, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  // 4. Create a Room
  async CreateRoomController(req, res, next) {
    const roomData = req.body;
    try {
      const newRoom = await createRoomService(roomData);
      return res
        .status(StatusCodeEnums.Created_201)
        .json({ data: newRoom, message: "Room created successfully!" });
    } catch (error) {
      next(error);
    }
  }

  // 5. Get a Specific Room by ID
  async GetRoomController(req, res, next) {
    const roomId = req.params.id;
    try {
      const room = await getRoomService(roomId);
      if (!room) {
        throw new CoreException(StatusCodeEnums.NotFound_404, "Room not found");
      }
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ data: room, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  // 6. Get All Rooms
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

  // 7. Update a Room by ID
  async UpdateRoomController(req, res, next) {
    const roomId = req.params.id;
    const roomData = req.body;
    try {
      const updatedRoom = await updateRoomService(roomId, roomData);
      if (!updatedRoom) {
        throw new CoreException(StatusCodeEnums.NotFound_404, "Room not found");
      }
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ data: updatedRoom, message: "Room updated successfully!" });
    } catch (error) {
      next(error);
    }
  }

  // 8. Delete a Room by ID (Soft Delete)
  async DeleteRoomController(req, res, next) {
    const roomId = req.params.id;
    try {
      const deletedRoom = await deleteRoomService(roomId);
      if (!deletedRoom) {
        throw new CoreException(StatusCodeEnums.NotFound_404, "Room not found");
      }
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ data: deletedRoom, message: "Room deleted successfully!" });
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
