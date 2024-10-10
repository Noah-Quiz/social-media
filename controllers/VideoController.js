const {
  createVideoService,
  toggleLikeVideoService,
  viewIncrementService,
  updateAVideoByIdService,
  getVideosByUserIdService,
  deleteVideoService,
  getVideoService,
  getVideosService,
} = require("../services/VideoService");
const { default: mongoose } = require("mongoose");
require("dotenv").config();

class VideoController {
  async createVideoController(req, res) {
    const { title, description, enumMode, categoryIds } = req.body;
    const userId = req.userId;

    try {
      if (!req.files.videoUrl || !req.files.thumbnailUrl) {
        return res
          .status(400)
          .json({ message: "Video and thumbnail files are required." });
      }

      const videoFile = req.files.videoUrl[0];
      const thumbnailFile = req.files.thumbnailUrl[0];

      const video = await createVideoService(userId, videoFile, thumbnailFile, {
        title,
        description,
        categoryIds,
        enumMode,
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
      return res.status(400).json({ message: "Invalid video ID" });
    }

    let thumbnailFile = null;
    if (req.files && req.files.thumbnailUrl) {
      thumbnailFile = req.files.thumbnailUrl[0];
    }

    const data = req.body;

    try {
      const video = await updateAVideoByIdService(videoId, data, thumbnailFile);
      return res
        .status(200)
        .json({ message: "Update video successfully", video });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async deleteVideoController(req, res) {
    const { videoId } = req.params;
    const userId = req.userId;

    if (!videoId) {
      res.status(500).json({ message: "Video ID required" });
      return;
    }

    try {
      const video = await deleteVideoService(videoId, userId);

      if (!video) {
        res.status(404).json({ message: "No video found" });
      }

      res.status(200).json({ message: "Delete Video successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getVideosByUserIdController(req, res) {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      const videos = await getVideosByUserIdService(userId);

      return res.status(200).json({ message: "Success", videos });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getVideoController(req, res) {
    const { videoId } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    try {
      const video = await getVideoService(videoId);

      return res.status(200).json({ message: "Success", video });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getVideosController(req, res) {
    const query = req.query;

    try {
      if (query.page < 1) {
        return res.status(400).json({ message: "Page cannot be less than 1" })
      }
      if (query.title) {
        query.title = { $regex: query.title, $options: "i" };
      }

      const { videos, totalDocuments, currentPage, totalPages } = await getVideosService(query);

      return res.status(200).json({ message: "Success", videos, totalDocuments, currentPage, totalPages });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = VideoController;
