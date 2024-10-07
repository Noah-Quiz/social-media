const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const Vimeo = require('vimeo').Vimeo;

const vimeoClient = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_CLIENT_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

// Initialize application and server
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

app.use("/api", require("./routes/AuthRoute"));
app.use("/api", require("./routes/VideoRoute"));

// Log API requests
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

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
