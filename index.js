const dotenv = require("dotenv");
require("dotenv").config();
const express = require("express");
const getLogger = require("./utils/logger");
const swaggerDoc = require("./utils/swagger");
const cors = require("cors");
const categoryRoutes = require("./routes/CategoryRoute");
const myPlaylistRoutes = require("./routes/MyPlaylistRoute");
const authRoutes = require("./routes/AuthRoute");
const messageRoutes = require("./routes/MessageRoute");
const videoRoutes = require("./routes/VideoRoute");
const userRoute = require("./routes/UserRoute");
const roomRoutes = require("./routes/RoomRoute");
const { createAMessageService } = require("./services/MessageService");
const { getAnUserByIdService } = require("./services/UserService");
const commentRoutes = require("./routes/CommentRoute");
const vnpayRoutes = require("./routes/VnpayRoute");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const Vimeo = require("vimeo").Vimeo;

const vimeoClient = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_CLIENT_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

function handleLeaveRoom(socket, roomId) {
  socket.leave(roomId);
  console.log(`User left room: ${roomId}`);
}

// Listen for socket connections
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Public Chat: Joining a default room
  socket.on("join_public_chat", () => {
    const room = "public_room";
    socket.join(room);
    console.log(`${socket.id} joined public room`);
  });

  // Private Chat: Join a private room between two users
  socket.on("join_private_chat", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined private room: ${roomId}`);
  });

  // Group Chat: Join a group room
  socket.on("join_group_chat", (groupId) => {
    socket.join(groupId);
    console.log(`${socket.id} joined group room: ${room}`);
  });

  // Livestreaming Chat: Join livestream room
  socket.on("join_livestream_chat", (streamId) => {
    const room = `livestream_${streamId}`;
    socket.join(room);
    console.log(`${socket.id} joined livestream room: ${room}`);
  });

  // Sending messages
  socket.on("send_message", async ({ roomId, userId, message }) => {
    await createAMessageService(userId, roomId, message);
    const user = await getAnUserByIdService(userId);
    io.to(roomId).emit("receive_message", {
      sender: user.fullName,
      message,
      avatar: user.avatar,
    });
    console.log(`Message sent to ${room}: ${message}`);
  });

  // Leaving a room (for private, group, livestream chat)
  socket.on("leave_room", (room) => {
    socket.leave(room);
    console.log(`${socket.id} left room: ${room}`);
  });

  // Disconnect event
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.get("/", (req, res) => {
  res.send(
    "<a href='/api/auth/google'>Login with Google</a><br>" +
      "<a href='/api/auth/apple'>Login with Apple</a>"
  );
});

// Log API requests
app.use((req, res, next) => {
  const logger = getLogger("API");
  logger.info(req.path, req.method);
  next();
});

// routers
app.use("/api/auth", authRoutes);
app.use("/api/my-playlists", myPlaylistRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoute);
app.use("/api/messages", messageRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/vnpay", vnpayRoutes);
// Start server
const port = process.env.DEVELOPMENT_PORT || 4000;

server.listen(port, (err) => {
  const logger = getLogger("APP");
  if (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  } else {
    logger.info(`Server is running at: http://localhost:${port}`);
    swaggerDoc(app, port);
  }
});
