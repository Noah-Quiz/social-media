const {
  updateStreamViewsService,
  getStreamService,
} = require("../services/StreamService");
const { createAMessageService } = require("../services/MessageService");
const { getAnUserByIdService } = require("../services/UserService");
const getLogger = require("../utils/logger.js");
const { getRoomService } = require("../services/RoomService.js");
const { getVideoService } = require("../services/VideoService.js");
const {
  getBunnyStreamVideoService,
} = require("../services/BunnyStreamService.js");
const eventEmitter = require("./events.js");
require("dotenv").config();
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

    eventEmitter.on("upload_progress", ({ videoId, progress }) => {
      io.to(socket.id).emit("upload_progress", progress);
      logger.info(`Upload progress for ${videoId}: ${progress}`);
    });
    socket.on("check_video_status", async (videoId) => {
      try {
        const video = await getVideoService(videoId);
        const bunnyVideo = await getBunnyStreamVideoService(
          process.env.BUNNY_STREAM_VIDEO_LIBRARY_ID,
          video.bunnyId
        );
        io.to(socket.id).emit("video_upload_status", bunnyVideo.status);
        logger.info(`Video status: ${bunnyVideo.status}`);
      } catch (error) {
        logger.error(`Error checking video status: ${error}`);
      }
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

  //   async function handleIfTypeOfRoomIsMember(roomId, senderId) {
  //     try {
  //       const room = await getRoomService(roomId);
  //       const stream = await getStreamService();
  //     } catch (error) {}
  //   }
};
