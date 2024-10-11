const express = require("express");
const VideoController = require("../controllers/VideoController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");

// Thiết lập multer cho việc upload video và hình ảnh
const upload = require("../utils/validatorFile");
const { getVideo } = require("../middlewares/LoadFile");

const videoRoutes = express.Router();
const videoController = new VideoController();

videoRoutes.post(
  "/",
  upload.fields([{ name: "videoUrl" }, { name: "thumbnailUrl" }]),
  AuthMiddleware,
  videoController.createVideoController
);

videoRoutes.get("/user/:userId", videoController.getVideosByUserIdController);

videoRoutes.get(
  "/my-playlist/:playlistId",
  videoController.getVideosByPlaylistIdController
);

videoRoutes.put(
  "/:videoId",
  upload.fields([{ name: "thumbnailUrl" }]),
  videoController.updateAVideoByIdController
);

videoRoutes.post(
  "/like/:videoId",
  AuthMiddleware,
  videoController.toggleLikeVideoController
);

videoRoutes.post(
  "/view/:videoId",
  AuthMiddleware,
  videoController.viewIncrementController
);
videoRoutes.delete("/delete/:id", AuthMiddleware, videoController.deleteVideo);
module.exports = videoRoutes;
