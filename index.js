const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const connection = require("./src/config/database");

// Initialize application and server
const app = express();
const userRoute = require("./src/route/userRoute");

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
app.use("/api", userRoute);
// Log API requests
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Start server
const port = process.env.DEVELOPMENT_PORT || 4000;
(async () => {
  try {
    await connection();

    app.listen(port, () => {
      console.log(`Backend Nodejs App listening on port ${port}`);
    });
  } catch (error) {
    console.log(">>> Error connect to DB: ", error);
  }
})();
