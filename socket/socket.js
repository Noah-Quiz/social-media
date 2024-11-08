const {
  updateStreamViewsService,
  getStreamService,
} = require("../services/StreamService");
const { createAMessageService } = require("../services/MessageService");
const { getUserByIdService } = require("../services/UserService");
const getLogger = require("../utils/logger.js");
const { getRoomService } = require("../services/RoomService.js");
const { getVideoService } = require("../services/VideoService.js");
const {
  getBunnyStreamVideoService,
} = require("../services/BunnyStreamService.js");
const eventEmitter = require("./events.js");
require("dotenv").config();

module.exports = (io) => {
  // console.log("Socket created: ", io);
  io.on("connection", (socket) => {
    const logger = getLogger("SOCKET");
    const userStreams = new Set();
    logger.info(`User connected: ${socket.id}`);

    // Handle joining a livestream chat
    socket.on("join_livestream_chat", async (streamId) => {
      try {
        socket.join(streamId);
        userStreams.add(streamId);
        await updateViewersCount(streamId);
        logger.info(`${socket.id} joined livestream room: ${streamId}`);
      } catch (error) {
        logger.error(`Fail to join live stream`);
      }
    });

    // Handle sending messages in rooms
    socket.on("send_message", async ({ roomId, userId, message }) => {
      try {
        await createAMessageService(userId, roomId, message);
        const user = await getUserByIdService(userId);
        io.to(roomId).emit("receive_message", {
          sender: user.nickName,
          message,
          avatar: user.avatar,
        });
        logger.info(`Message sent to room ${roomId}`);
      } catch (error) {
        io.to(roomId).emit("receive_message", {
          messageError: "Fail to send message",
        });
      }
    });

    // Handle leaving a livestream
    socket.on("leave_livestream", async (streamId) => {
      try {
        userStreams.delete(streamId);
        await handleLeaveLiveStream(socket, streamId);
        logger.info(`${socket.id} left livestream room: ${streamId}`);
      } catch (error) {
        logger.error(`Error when do this action`);
      }
    });

    // Handle disconnect event
    socket.on("disconnect", () => {
      logger.info(`User disconnected: ${socket.id}`);
    });

    eventEmitter.on("upload_video_progress", ({ userId, progress }) => {
      const queryUserId = socket.handshake.query.userId;
      if (queryUserId) {
        io.to(socket.id).emit(
          "upload_video_progress",
          `User ${queryUserId} uploaded video: ${progress}%`
        );
      }
    });
  });

  // Update viewers count for a specific stream
  async function updateViewersCount(streamId) {
    const viewersCount = io.sockets.adapter.rooms.get(streamId)?.size || 0;
    await updateStreamViewsService(streamId, viewersCount);
    io.to(streamId).emit("viewers_count", viewersCount);
  }

  // Handle the logic when a user leaves a livestream
  async function handleLeaveLiveStream(socket, streamId) {
    socket.leave(streamId);
    await updateViewersCount(streamId);
  }
};
