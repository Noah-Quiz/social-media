const express = require("express");
const cors = require("cors");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();
const userRoute = require("./routes/userRoute");

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

app.use("/api", categoryRoutes);
app.use("/api/user", userRoute);
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
