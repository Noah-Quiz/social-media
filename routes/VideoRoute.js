const express = require("express");
const VideoController = require("../controllers/VideoController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const upload = require("../utils/validatorFile");
const { uploadVideo, uploadImage } = require("../utils/stores/storeImage");
const videoRoutes = express.Router();
const videoController = new VideoController();

videoRoutes.post(
  "/",
  AuthMiddleware,
  // uploadImage.fields([{ name: "videoThumbnail" }, { name: "video" }]),
  videoController.createVideoController
);

videoRoutes.put(
  "/",
  AuthMiddleware,
  uploadImage.fields([{ name: "videoThumbnail" }, { name: "video" }]),
  videoController.uploadVideoController
);

videoRoutes.get("/", AuthMiddleware, videoController.getVideosController);

videoRoutes.get("/user/:userId", videoController.getVideosByUserIdController);

videoRoutes.get(
  "/my-playlist/:playlistId",
  videoController.getVideosByPlaylistIdController
);

videoRoutes.put(
  "/:videoId",
  AuthMiddleware,
  upload.fields([{ name: "thumbnailUrl" }]),
  videoController.updateAVideoByIdController
);

videoRoutes.get(
  "/:videoId",
  AuthMiddleware,
  videoController.getVideoController
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

videoRoutes.delete(
  "/:videoId",
  AuthMiddleware,
  videoController.deleteVideoController
);
module.exports = videoRoutes;
