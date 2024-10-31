const {
  updateStreamViewsService,
  getStreamService,
} = require("../services/StreamService");
const { createAMessageService } = require("../services/MessageService");
const { getAnUserByIdService } = require("../services/UserService");
const getLogger = require("../utils/logger.js");
const { getRoomService } = require("../services/RoomService.js");

let viewersCount = 0;

module.exports = (io) => {
  io.on("connection", (socket) => {
    const logger = getLogger("SOCKET");
    const userStreams = new Set();
    logger.info(`User connected: ${socket.id}`);

    // Handle joining a livestream chat
    socket.on("join_livestream_chat", (streamId) => {
      const room = `livestream_${streamId}`;
      socket.join(room);
      userStreams.add(streamId);
      updateViewersCount(streamId);
      logger.info(`${socket.id} joined livestream room: ${room}`);
    });

    // Handle sending messages in rooms
    socket.on("send_message", async ({ roomId, userId, message }) => {
      await createAMessageService(userId, roomId, message);
      const user = await getAnUserByIdService(userId);
      io.to(roomId).emit("receive_message", {
        sender: user.fullName,
        message,
        avatar: user.avatar,
      });
      logger.info(`Message sent to room ${roomId}`);
    });

    // Handle leaving a livestream
    socket.on("leave_livestream", (streamId) => {
      handleLeaveLiveStream(socket, streamId);
      userStreams.delete(streamId);
      logger.info(`${socket.id} left livestream room: ${streamId}`);
    });

    // Handle disconnect event
    socket.on("disconnect", () => {
      updateViewersCountForAllRooms();
      logger.info(`User disconnected: ${socket.id}`);
    });
  });

  // Update viewers count for a specific stream
  async function updateViewersCount(streamId) {
    const viewersCount = io.sockets.adapter.rooms.get(streamId)?.size || 0;
    await updateStreamViewsService(streamId, {
      currentViewCount: viewersCount,
    });
    io.to(streamId).emit("viewers_count", viewersCount);
  }

  // Handle the logic when a user leaves a livestream
  async function handleLeaveLiveStream(socket, streamId) {
    socket.leave(streamId);
    await updateStreamViewsService(streamId);
  }

  // Update viewers count for all rooms
  async function updateViewersCountForAllRooms() {
    const rooms = io.sockets.adapter.rooms;
    rooms.forEach((room, roomId) => {
      const viewersCount = room.size || 0;
      io.to(roomId).emit("viewers_count", viewersCount);
    });
  }
};
