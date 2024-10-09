const express = require("express");
const VideoController = require("../controllers/VideoController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const upload = require("../utils/validatorFile");
const videoRoutes = express.Router();
const videoController = new VideoController();

videoRoutes.post("/", upload.fields([{ name: "videoUrl" }, { name: "thumbnailUrl" }]), AuthMiddleware, videoController.createVideoController);

videoRoutes.get("/user/:userId", videoController.getVideosByUserIdController);

videoRoutes.put("/:videoId", upload.fields([{ name: "thumbnailUrl" }]), videoController.updateAVideoByIdController);

videoRoutes.post("/like/:videoId", AuthMiddleware, videoController.toggleLikeVideoController);

videoRoutes.post("/view/:videoId", AuthMiddleware, videoController.viewIncrementController);

videoRoutes.delete("/:videoId", AuthMiddleware, videoController.deleteVideoController);

module.exports = videoRoutes;
