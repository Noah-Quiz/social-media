const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const categoryRoutes = require("./routes/categoryRoutes");
const myPlaylistRoutes = require('./routes/MyPlaylistRoute');

const app = express();

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

// Log API requests
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// routers
app.use("/api", myPlaylistRoutes);
app.use("/api", categoryRoutes);

// Start server
const port = process.env.DEVELOPMENT_PORT || 4000;
app.listen(port, (err) => {
  if (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  } else {
    console.log(`Server started! Listening on port ${port}`);
  }
});
