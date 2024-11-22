const {
  updateStreamViewsService,
} = require("../services/StreamService");
const {
  createAMessageService,
  updateMessageService,
} = require("../services/MessageService"); // Add updateMessageService
const { getUserByIdService } = require("../services/UserService");
const getLogger = require("../utils/logger.js");
const { getRoomService } = require("../services/RoomService.js");
const eventEmitter = require("./events.js");
const jwt = require("jsonwebtoken");
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
        logger.info(`${socket.id} joined live stream room: ${streamId}`);
      } catch (error) {
        logger.error(`Failed to join live stream room: ${error.message}`);
      }
    });

    socket.on("join_conversation_chat", async ({ roomId }) => {
      try {
        const token = socket.handshake.headers['authorization']
        const userId = await validateAndExtractToken(token);
        await getUserByIdService(userId);
        
        await getRoomService(userId, roomId);
    
        socket.join(roomId);
        userStreams.add(roomId);
        logger.info(`${socket.id} joined conversation room: ${roomId}`);
      } catch (error) {
        logger.error(`Failed to join conversation room: ${error.message}`);
        socket.emit("join_conversation_chat_error", { message: error.message });
      }
    });
    

    if (socketPath == "/socket/chat") {
      socket.on("send_message", async ({ roomId, token, message, role }) => {
        try {
          const userId = await validateAndExtractToken(token);
          const user = await getUserByIdService(userId);

          if (!socket.rooms.has(roomId)) {
            logger.info(`${socket.id} is not in room ${roomId}, cannot send message`);
            socket.emit("send_message_error", { error: `${socket.id} is not in room ${roomId}, cannot send message` });
            return;
          }

          try {
            await createAMessageService(userId, roomId, message);
          } catch (error) {
            logger.warn(error.message);
          }

          io.to(roomId).emit("receive_message", {
            userId,
            sender: user.nickName,
            message,
            avatar: user.avatar,
            role,
          });
          
          logger.info(`Message sent to room: ${roomId}`);
        } catch (error) {
          socket.emit("send_message_error", {
            error: `Failed to send message: ${error.message}`,
          }); 
        }
      });
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

    socket.on("leave_conversation", (roomId) => {
      logger.info(`${socket.id} left room: ${roomId}`);
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
  
  async function validateAndExtractToken(token) {
    try {
      if (!token) throw new Error("Authorization token required")

      const { _id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      return _id;
    } catch (error) {
      throw error
    }
  }
};
