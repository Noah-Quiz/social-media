
const {
  createVideoService,
  toggleLikeVideoService,
  viewIncrementService,
  updateAVideoByIdService,
  deleteVideo,
  getVideosByUserIdService,
} = require("../services/VideoService");
const { uploadFiles } = require("../middlewares/LoadFile");
const createAccessToken = require("../utils/createAccessToken");
const { default: mongoose } = require("mongoose");
require("dotenv").config();

class VideoController {
  async createVideoController(req, res) {
    const { title, description, enumMode, categoryIds } = req.body;
    const userId = req.userId;

    try {
      
      if (!req.files.videoUrl || !req.files.thumbNailUrl) {
        return res
          .status(400)
          .json({ message: "Video and thumbnail files are required." });
      }

      const videoFile = req.files.videoUrl[0];
      const thumbNailFile = req.files.thumbNailUrl[0];

      const { videoUrl, imgUrl } = await uploadFiles(videoFile, thumbNailFile);

      const video = await createVideoService(userId, {
        title,
        description,
        categoryIds,
        enumMode,
        videoUrl,
        thumbNailUrl: imgUrl, 
      });

      res.status(201).json({ message: "Create Video successfully", video });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async toggleLikeVideoController(req, res) {
    const { videoId } = req.params;
    const { action } = req.query;
    const userId = req.userId;

    try {
      await toggleLikeVideoService(videoId, userId, action);

      return res.status(200).json({ message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async viewIncrementController(req, res) {
    const { videoId } = req.params;

    try {
      await viewIncrementService(videoId);

      return res.status(200).json({ message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async updateAVideoByIdController(req, res) {
    const { videoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "VideoId is not an ObjectId" });
    }
    // const thumbnail = req.files.thumbnailUrl[0];
    // const thumbnailUrl = await setThumbnail(thumbnail);
    const data = req.body;

    try {
      const video = await updateAVideoByIdService(videoId, data);
      return res
        .status(200)
        .json({ message: "Update video successfully", video });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async deleteVideo(req, res) {
    const id = req.params;
    const userId = req.userId;
    if (!id) {
      res.status(500).json({ error: "Id required" });
      return;
    }
    if (!userId) {
      res.status(500).json({ error: "userId required" });
      return;
    }
    try {
      const video = await deleteVideo(id, userId);
      if (!video) {
        res.status(404).json({ message: "no video" });
      }
      res.status(200).json({ message: "Delete Video successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getVideosByUserIdController(req, res) {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "UserId is not an ObjectId" });
    }

    try {
      const videos = await getVideosByUserIdService(userId);
      return res.status(200).json({ message: "Successfully", videos });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = VideoController;
