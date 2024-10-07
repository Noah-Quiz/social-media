const express = require("express");
const VideoController = require("../controllers/VideoController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");

// Thiết lập multer cho việc upload video và hình ảnh
const upload = require("../utils/validatorFile");

const videoRoutes = express.Router();
const videoController = new VideoController();

videoRoutes.post(
  "/createVideo",
  upload.fields([{ name: "videoUrl" }, { name: "thumbnailUrl" }]),
  AuthMiddleware,
  videoController.createVideoController
);
videoRoutes.put(
  "/:videoId",
  upload.fields([{ name: "thumbnailUrl" }]),
  videoController.updateAVideoByIdController
);

module.exports = videoRoutes;
