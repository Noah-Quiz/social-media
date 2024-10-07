const express = require("express");
const VideoController = require("../controllers/VideoController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");

// Thiết lập multer cho việc upload video và hình ảnh
const upload = require("../utils/validatorFile");

const videoRoutes = express.Router();
const videoController = new VideoController();

videoRoutes.post("/video/createVideo", upload.fields([{ name: 'size' },{ name: 'videoUrl' }, { name: 'thumbNailUrl' }]), AuthMiddleware, videoController.createVideoController);

videoRoutes.post("/videos/like/:videoId", AuthMiddleware, videoController.toggleLikeVideoController);

videoRoutes.post("/videos/view/:videoId", AuthMiddleware, videoController.viewIncrementController);

module.exports = videoRoutes;
