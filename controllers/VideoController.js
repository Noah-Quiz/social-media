const GetVideosByPlaylistIdDto = require("../dtos/Video/GetVideosByPlaylistId");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const {
  createBunnyStreamVideoService,
  uploadBunnyStreamVideoService,
  deleteBunnyStreamVideoService,
  updateBunnyStreamVideoService,
} = require("../services/BunnyStreamService");
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
  uploadVideoService,
  generateVideoEmbedUrlToken,
} = require("../services/VideoService");
const { default: mongoose } = require("mongoose");
const { deleteFile, checkFileSuccess } = require("../utils/stores/storeImage");
const UploadVideoDto = require("../dtos/Video/UploadVideoDto");
const DeleteVideoDto = require("../dtos/Video/DeleteVideoDto");
const GenerateVideoEmbedUrlTokenDto = require("../dtos/Video/GenerateVideoEmbedUrlTokenDto");
const { sendMessageToQueue } = require("../utils/rabbitMq");
require("dotenv").config();

class VideoController {
  async createVideoController(req, res) {
    try {
      const { title, description, enumMode, categoryIds } = req.body;
      const userId = req.userId;

      const bunnyVideo = await createBunnyStreamVideoService(
        process.env.BUNNY_STREAM_VIDEO_LIBRARY_ID,
        title
      );
      const video = await createVideoService(userId, {
        title,
        description,
        categoryIds,
        enumMode,
        bunnyId: bunnyVideo.guid,
        videoUrl: `https://${process.env.BUNNY_STREAM_CDN_HOST_NAME}/${bunnyVideo.guid}/playlist.m3u8`,
        videoEmbedUrl: `https://iframe.mediadelivery.net/embed/${process.env.BUNNY_STREAM_VIDEO_LIBRARY_ID}/${bunnyVideo.guid}`,
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

  async generateVideoEmbedUrlTokenController(req, res) {
    try {
      const { videoId } = req.params;
      const { dateExpire } = req.body; // UNIX format
      const generateVideoEmbedUrlTokenDto = new GenerateVideoEmbedUrlTokenDto(
        videoId,
        dateExpire
      );
      await generateVideoEmbedUrlTokenDto.validate();

      await generateVideoEmbedUrlToken(videoId, dateExpire);
      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      if (req.files) {
        await deleteFile(req.files.video[0].path);
        await deleteFile(req.files.videoThumbnail[0].path);
      }
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async uploadVideoController(req, res) {
    try {
      const userId = req.userId;
      const { videoId } = req.params;
      const videoFile = req.files.video[0];
      const thumbnailFile = req.files.videoThumbnail[0];
      const uploadVideoDto = new UploadVideoDto(
        userId,
        videoId,
        videoFile,
        thumbnailFile
      );
      await uploadVideoDto.validate();

      const video = await uploadVideoService(
        videoId,
        userId,
        videoFile.path,
        thumbnailFile.path
      );

      const queueMessage = {
        bunnyId: video.bunnyId,
        videoFilePath: videoFile.path,
      };
      await sendMessageToQueue("bunny_video_dev_hung", queueMessage);

      // const bunnyVideo = await uploadBunnyStreamVideoService(
      //   process.env.BUNNY_STREAM_VIDEO_LIBRARY_ID,
      //   video.bunnyId,
      //   videoFile.path
      // );

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      if (req.files) {
        await deleteFile(req.files.video[0].path);
        await deleteFile(req.files.videoThumbnail[0].path);
      }
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
    try {
      const { videoId } = req.params;

      let thumbnailFile = null;
      if (req.files && req.files.videoThumbnail) {
        thumbnailFile = req.files.videoThumbnail[0];
      }

      const data = req.body;

      const video = await updateAVideoByIdService(videoId, data, thumbnailFile);
      const bunnyVideo = await updateBunnyStreamVideoService(
        process.env.BUNNY_STREAM_VIDEO_LIBRARY_ID,
        video.bunnyId,
        data.title
      );
      await checkFileSuccess(thumbnailFile.path);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ video, message: "Update video successfully" });
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
    try {
      const { videoId } = req.params;
      const userId = req.userId;
      const deleteVideoDto = new DeleteVideoDto(videoId, userId);
      await deleteVideoDto.validate();

      const video = await deleteVideoService(videoId, userId);

      const bunnyVideo = await deleteBunnyStreamVideoService(
        process.env.BUNNY_STREAM_VIDEO_LIBRARY_ID,
        video.bunnyId
      );

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
