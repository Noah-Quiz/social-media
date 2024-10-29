require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const getLogger = require("./utils/logger.js");
const swaggerDoc = require("./utils/swagger");
const cors = require("cors");
const categoryRoutes = require("./routes/CategoryRoute");
const myPlaylistRoutes = require("./routes/MyPlaylistRoute");
const authRoutes = require("./routes/AuthRoute");
const messageRoutes = require("./routes/MessageRoute");
const videoRoutes = require("./routes/VideoRoute");
const userRoute = require("./routes/UserRoute");
const roomRoutes = require("./routes/RoomRoute");
const commentRoutes = require("./routes/CommentRoute");
const vnpayRoutes = require("./routes/VnpayRoute");
const receiptRoutes = require("./routes/ReceiptRoute");
const streamRoutes = require("./routes/StreamRoute");
const giftRoutes = require("./routes/GiftRoute");
const giftHistoryRoutes = require("./routes/GiftHistoryRoute");
const exchangeRateRoutes = require("./routes/ExchangeRateRoutes");
const { default: helmet } = require("helmet");
const limiter = require("./middlewares/RateLimiter.js");
const packageRoutes = require("./routes/AdvertisementPackageRoute.js");
const advertisementRoutes = require("./routes/AdvertisementRoute.js");
const memberPackRoutes = require("./routes/MemberPackRoute.js");
const memberGroupRoutes = require("./routes/MemberGroupRoute.js");
const paymentRouters = require("./routes/PaymentRoute.js");
const { updateStreamViewsService } = require("./services/StreamService.js");
const path = require("path");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Security
app.use(helmet());
app.disable("x-powered-by");
app.use(limiter(15, 100));

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Session configuration
app.use(
  session({
    cookie: { maxAge: 86400000 }, // 1 day
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    resave: false,
    secret: "abcxyz",
    saveUninitialized: true,
  })
);
app.use("/", express.static(__dirname));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const Vimeo = require("vimeo").Vimeo;

const vimeoClient = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_CLIENT_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

app.get("/", (req, res) => {
  res.send(
    "<a href='/api/auth/google'>Login with Google</a><br>" +
      "<a href='/api/auth/apple'>Login with Apple</a>"
  );
});

// Log API requests
app.use((req, res, next) => {
  const logger = getLogger("API");
  logger.info(req.method + " " + req.path);
  next();
});

// routers
app.use("/api/auth", authRoutes);
app.use("/api/my-playlists", myPlaylistRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoute);
app.use("/api/messages", messageRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/StreauserStreams", roomRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/payment", paymentRouters);
app.use("/api/vnpay", vnpayRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/streams", streamRoutes);
app.use("/api/advertisements", advertisementRoutes);
app.use("/api/gifts/", giftRoutes);
app.use("/api/gift-history/", giftHistoryRoutes);
app.use("/api/exchange-rate/", exchangeRateRoutes);
app.use("/api/member-pack", memberPackRoutes);
app.use("/api/member-group", memberGroupRoutes);
app.use("/api/advertisement-packages", packageRoutes);
// Start server
const port = process.env.DEVELOPMENT_PORT || 4000;

server.listen(port, async (err) => {
  const logger = getLogger("APP");
  const cron = require("./utils/cronJob.js");
  if (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  } else {
    logger.info(`Server is running at: http://localhost:${port}`);

    swaggerDoc(app, port);
  }
});
