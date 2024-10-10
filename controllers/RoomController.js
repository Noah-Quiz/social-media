const {
  createRoom,
  deleteRoom,
  getAllRooms,
  getRoom,
  updateRoom,
  DirectMessage,
  getRoomUserId,
  getRoomVideoId,
  getGlobalRoom,
} = require("../services/RoomService");

class RoomController {
  // 1. Global Chat Room
  async GlobalChatController(req, res) {
    try {
      const globalRoom = await getGlobalRoom();
      return res.status(200).json({ data: globalRoom, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // 2. Direct Message Room
  async DirectMessageController(req, res) {
    const currentUserId = req.userId;
    const targetedUserId = req.query.userId;
    try {
      const directMessageRoom = await DirectMessage(
        currentUserId,
        targetedUserId
      );
      return res
        .status(200)
        .json({ data: directMessageRoom, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // 3. Video Chat Room
  async VideoChatController(req, res) {
    const videoId = req.query.videoId;
    try {
      const roomVideoId = await getRoomVideoId(videoId);
      return res.status(200).json({ data: roomVideoId, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // 4. Create a Room
  async CreateRoomController(req, res) {
    const roomData = req.body;
    try {
      const newRoom = await createRoom(roomData);
      return res
        .status(201)
        .json({ data: newRoom, message: "Room created successfully!" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // 5. Get a Specific Room by ID
  async GetRoomController(req, res) {
    const roomId = req.params.id;
    try {
      const room = await getRoom(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      return res.status(200).json({ data: room, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // 6. Get All Rooms
  async GetAllRoomsController(req, res) {
    try {
      const rooms = await getAllRooms();
      return res.status(200).json({ data: rooms, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // 7. Update a Room by ID
  async UpdateRoomController(req, res) {
    const roomId = req.params.id;
    const roomData = req.body;
    try {
      const updatedRoom = await updateRoom(roomId, roomData);
      if (!updatedRoom) {
        return res.status(404).json({ message: "Room not found" });
      }
      return res
        .status(200)
        .json({ data: updatedRoom, message: "Room updated successfully!" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // 8. Delete a Room by ID (Soft Delete)
  async DeleteRoomController(req, res) {
    const roomId = req.params.id;
    try {
      const deletedRoom = await deleteRoom(roomId);
      if (!deletedRoom) {
        return res.status(404).json({ message: "Room not found" });
      }
      return res
        .status(200)
        .json({ data: deletedRoom, message: "Room deleted successfully!" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  //9. Get all direct message by userID

  async UserChatRoomsController(req, res) {
    const userId = req.userId;
    try {
      const rooms = await getRoomUserId(userId);
      res
        .status(200)
        .json({ data: rooms, size: rooms.length, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = RoomController;
