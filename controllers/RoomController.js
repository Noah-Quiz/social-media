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
  handleMemberGroupChatService,
} = require("../services/RoomService");

const mongoose = require("mongoose");

class RoomController {
  // 1. Global Chat Room
  async GlobalChat(req, res) {
    try {
      const globalRoom = await getGlobalRoom();
      return res.status(200).json({ data: globalRoom, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // 2. Direct Message Room
  async DirectMessage(req, res) {
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
  async VideoChat(req, res) {
    const videoId = req.query.videoId;
    try {
      const roomVideoId = await getRoomVideoId(videoId);
      return res.status(200).json({ data: roomVideoId, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // 4. Create a Room
  async CreateRoom(req, res) {
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
  async GetRoom(req, res) {
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
  async GetAllRooms(req, res) {
    try {
      const rooms = await getAllRooms();
      return res.status(200).json({ data: rooms, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // 7. Update a Room by ID
  async UpdateRoom(req, res) {
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
  async DeleteRoom(req, res) {
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

  async UserChatRooms(req, res) {
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

  async handleMemberGroupChatController(req, res) {
    const { roomId, memberId, action } = req.body;
    const room = await getRoom(roomId);
    console.log(room);
    if (
      !mongoose.Types.ObjectId.isValid(roomId) ||
      !mongoose.Types.ObjectId.isValid(memberId)
    ) {
      return res
        .status(500)
        .json({ message: "RoomId and userId is not an ObjectId" });
    }
    if (room.type !== "group") {
      return res.status(400).json({ message: "This room type is not group" });
    }
    try {
      const result = await handleMemberGroupChatService(
        roomId,
        memberId,
        action
      );
      res.status(200).json({ message: "Success", data: result });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = RoomController;
