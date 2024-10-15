const GetVideosByPlaylistIdDto = require("../dtos/Video/GetVideosByPlaylistId");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const {
  createVideoService,
  toggleLikeVideoService,
  viewIncrementService,
  updateAVideoByIdService,
  getVideosByUserIdService,
  getVideosByPlaylistIdService,
  deleteVideoService,
  getVideoService,
  getVideosService,
  getStatsByDateService,
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
          .status(StatusCodeEnums.BadRequest_400)
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

      return res
        .status(StatusCodeEnums.Created_201)
        .json({ message: "Create Video successfully", video });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async toggleLikeVideoController(req, res) {
    const { videoId } = req.params;
    const { action } = req.query;
    const userId = req.userId;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Valid video ID is required" });
    }

    try {
      await toggleLikeVideoService(videoId, userId, action);

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async viewIncrementController(req, res) {
    const { videoId } = req.params;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Valid video ID is required" });
    }

    try {
      const video = await viewIncrementService(videoId);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ video: video, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async updateAVideoByIdController(req, res) {
    const { videoId } = req.params;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Valid video ID is required" });
    }

    let thumbnailFile = null;
    if (req.files && req.files.thumbnailUrl) {
      thumbnailFile = req.files.thumbnailUrl[0];
    }

    const data = req.body;

    try {
      const video = await updateAVideoByIdService(videoId, data, thumbnailFile);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Update video successfully", video });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async deleteVideoController(req, res) {
    const { videoId } = req.params;
    const userId = req.userId;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Valid video ID is required" });
    }

    try {
      await deleteVideoService(videoId, userId);

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async getVideosByUserIdController(req, res) {
    const { userId } = req.params;
    const { sortBy } = req.query;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Valid user ID is required" });
    }

    try {
      const videos = await getVideosByUserIdService(userId, sortBy);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Success", videos });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async getVideoController(req, res) {
    const { videoId } = req.params;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Valid video ID is required" });
    }

    try {
      const video = await getVideoService(videoId);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Success", video });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async getVideosController(req, res) {
    const query = req.query;

    if (!query.page) query.page = 1;
    if (!query.size) query.size = 10;

    try {
      if (query.page < 1) {
        return res
          .status(StatusCodeEnums.BadRequest_400)
          .json({ message: "Page cannot be less than 1" });
      }
      if (query.title) {
        query.title = { $regex: query.title, $options: "i" };
      }

      const { videos, total, page, totalPages } = await getVideosService(query);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Success", videos, total, page, totalPages });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async getVideosByPlaylistIdController(req, res) {
    try {
      const { playlistId } = req.params;
      const { page, size } = req.query;
      const getVideosByPlaylistId = new GetVideosByPlaylistIdDto(
        playlistId,
        page,
        size
      );
      await getVideosByPlaylistId.validate();

      const videos = await getVideosByPlaylistIdService(
        playlistId,
        page || 1,
        size || 10
      );
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ videos, message: "Get videos by playlistId successfully" });
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }
}

module.exports = VideoController;
