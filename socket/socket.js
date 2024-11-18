const {
  updateStreamViewsService,
  getStreamService,
} = require("../services/StreamService");
const {
  createAMessageService,
  updateMessageService,
} = require("../services/MessageService"); // Add updateMessageService
const { getUserByIdService } = require("../services/UserService");
const getLogger = require("../utils/logger.js");
const { getRoomService } = require("../services/RoomService.js");
const { getVideoService } = require("../services/VideoService.js");
const {
  getBunnyStreamVideoService,
} = require("../services/BunnyStreamService.js");
const eventEmitter = require("./events.js");

require("dotenv").config();
const logger = getLogger("SOCKET");

module.exports = (io) => {
  const socketPath = io.opts.path;
  logger.info(
    `Socket server started: ${process.env.APP_BASE_URL}${socketPath}`
  );
  io.on("connection", (socket) => {
    const userStreams = new Set();
    logger.info(`User connected: ${socket.id}`);

    // Handle joining a livestream chat
    socket.on("join_livestream_chat", async ({ streamId }) => {
      try {
        socket.join(streamId);
        userStreams.add(streamId);
        await updateViewersCount(streamId);
        logger.info(`${socket.id} joined live room: ${streamId}`);
      } catch (error) {
        logger.error(`Fail to join live room`);
      }
    });

    socket.on("join_video_chat", async ({ videoId }) => {
      try {
        socket.join(videoId);
        userStreams.add(streamId);
        logger.info(`${socket.id} joined video room: ${videoId}`);
      } catch (error) {
        logger.error(`Fail to join video room`);
      }
    });

    if (socketPath == "/socket/chat") {
      // Handle sending messages in rooms
      socket.on("send_message", async ({ roomId, userId, message, role }) => {
        try {
          const newMessage = await createAMessageService(
            userId,
            roomId,
            message
          );
          const user = await getUserByIdService(userId);
          io.to(roomId).emit("receive_message", {
            id: newMessage._id,
            userId,
            sender: user.nickName,
            message,
            avatar: user.avatar,
            role,
          });
          logger.info(`Message sent to room ${roomId}`);
        } catch (error) {
          io.to(roomId).emit("receive_message", {
            error: `Fail to send message ${error.message}`,
          });
        }
      });

      // Handle updating a message
      socket.on(
        "update_message",
        async ({ userId, messageId, roomId, newMessage }) => {
          try {
            // Update the message in the database
            const updatedMessage = await updateMessageService(
              userId,
              messageId,
              newMessage
            );

            if (updatedMessage) {
              io.to(roomId).emit("message_updated", {
                id: messageId,
                message: newMessage,
              });
              logger.info(`Message ${messageId} updated in stream ${roomId}`);
            } else {
              socket.emit("update_message_error", {
                error: `Message not found`,
              });
            }
          } catch (error) {
            socket.emit("update_message_error", {
              error: `Failed to update message ${error.message} `,
            });
            logger.error("Error updating message", error);
          }
        }
      );
    }

    // Handle leaving a livestream
    socket.on("leave_livestream", async (streamId) => {
      try {
        userStreams.delete(streamId);
        await handleLeaveLiveStream(socket, streamId);
        logger.info(`${socket.id} left livestream room: ${streamId}`);
      } catch (error) {
        logger.error(`Error when performing action`);
      }
    });

    // Handle disconnect event
    socket.on("disconnect", () => {
      logger.info(`User disconnected: ${socket.id}`);
    });

    if (socketPath == "/socket/upload") {
      eventEmitter.on("upload_video_progress", ({ userId, progress }) => {
        const queryUserId = socket.handshake.query.userId;
        if (queryUserId === userId) {
          io.to(socket.id).emit("upload_video_progress", progress);
        }
      });
    }

    if (socketPath == "/socket/stream") {
      eventEmitter.on(
        "live_stream_connected",
        ({ streamId, streamServerUrl }) => {
          const queryStreamId = socket.handshake.query.streamId;
          if (queryStreamId === streamId) {
            io.to(socket.id).emit("live_stream_connected", streamServerUrl);
          }
        }
      );
    }
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
