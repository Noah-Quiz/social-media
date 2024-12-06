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
const DatabaseTransaction = require("../repositories/DatabaseTransaction.js");
require("dotenv").config();

const logger = getLogger("SOCKET");

module.exports = (io) => {
  const socketPath = io.opts.path;

  logger.info(
    `Socket server started: ${process.env.APP_BASE_URL}${socketPath}`
  );

  io.on("connection", (socket) => {
    const userStreamMap = new Map(); // Key: socket.id, Value: streamId

    logger.info(`User connected: ${socket.id}`);

    // LIVESTREAM VIP CHAT
    socket.on("join_livestream_vip_chat", async ({ roomId }) => {
      try {
        console.log(userStreamMap)
        const token = socket.handshake.headers['authorization']
        const userId = await validateAndExtractToken(token);

        const connection = new DatabaseTransaction();
        const user = await connection.userRepository.findUserById(userId);
        isVip(user);

        socket.join(roomId);
        
        userStreamMap.set(socket.id, roomId);
        
        roomId = roomId.split("_")[0];
        await updateViewersCount(roomId);

        logger.info(`${socket.id} joined live stream vip room: ${roomId}`);
      } catch (error) {
        logger.error(`Failed to join live stream vip room: ${error.message}`);
        logger.error(`Stack Trace: ${error.stack}`);
        socket.emit("join_livestream_vip_chat_error", { message: error.message });
      }
    });

    // LIVESTREAM MEMBER CHAT
    socket.on("join_livestream_member_chat", async ({ roomId }) => {
      try {
        const token = socket.handshake.headers['authorization']
        const userId = await validateAndExtractToken(token);
        await getUserByIdService(userId);

        socket.join(roomId);
        
        userStreamMap.set(socket.id, roomId);
        
        roomId = roomId.split("_")[0];
        await updateViewersCount(roomId);

        logger.info(`${socket.id} joined live stream member room: ${roomId}`);
      } catch (error) {
        logger.error(`Failed to join live stream member room: ${error.message}`);
        logger.error(`Stack Trace: ${error.stack}`);
        socket.emit("join_livestream_member_chat_error", { message: error.message });
      }
    });

    // LIVESTREAM NORMAL CHAT
    socket.on("join_livestream_chat", async ({ streamId }) => {
      try {
        socket.join(streamId);

        userStreamMap.set(socket.id, streamId);

        await updateViewersCount(streamId);

        logger.info(`${socket.id} joined live stream room: ${streamId}`);
      } catch (error) {
        logger.error(`Failed to join live stream room: ${error.message}`);
        logger.error(`Stack Trace: ${error.stack}`);
        socket.emit("join_livestream_chat_error", { message: error.message });
      }
    });

    socket.on("join_conversation_chat", async ({ roomId }) => {
      try {
        const token = socket.handshake.headers['authorization']
        const userId = await validateAndExtractToken(token);
        await getUserByIdService(userId);

        await getRoomService(userId, roomId);

        socket.join(roomId);

        logger.info(`${socket.id} joined conversation room: ${roomId}`);
      } catch (error) {
        logger.error(`Failed to join conversation room: ${error.message}`);
        logger.error(`Stack Trace: ${error.stack}`);
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
          logger.error(`Failed to send message: ${error.message}`);
          logger.error(`Stack Trace: ${error.stack}`);
          socket.emit("send_message_error", {
            error: `Failed to send message: ${error.message}`,
          });
        }
      });
    }

    // Handle disconnect event
    socket.on("disconnect", async () => {
      const streamId = userStreamMap.get(socket.id); 
      if (streamId) {
        await updateViewersCount(streamId);
        userStreamMap.delete(socket.id);
      }
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
  async function updateViewersCount(baseStreamId) {
    try {
      const chatRoom = io.sockets.adapter.rooms.get(`${baseStreamId}`) || new Set();
      const memberChatRoom = io.sockets.adapter.rooms.get(`${baseStreamId}_member`) || new Set();
      const vipChatRoom = io.sockets.adapter.rooms.get(`${baseStreamId}_vip`) || new Set();

      const combinedViewers = new Set([...chatRoom, ...memberChatRoom, ...vipChatRoom]);

      const viewersCount = combinedViewers.size;

      await updateStreamViewsService(baseStreamId, viewersCount);

      io.to(`${baseStreamId}`).emit("viewers_count", viewersCount);
      io.to(`${baseStreamId}_member`).emit("viewers_count", viewersCount);
      io.to(`${baseStreamId}_vip`).emit("viewers_count", viewersCount);
    } catch (error) {
      logger.error(`Failed to update viewers count for stream: ${baseStreamId} - ${error.message}`);
      logger.error(`Stack Trace: ${error.stack}`);
    }
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

  function isVip(user) {
    try {
      if (user?.vip?.status === false) {
        throw new Error("The user doesn't have VIP subscription")
      }

      return true;
    } catch (error) {
      throw error
    }
  }
};
