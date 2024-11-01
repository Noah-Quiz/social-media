const GetVideosByPlaylistIdDto = require("../dtos/Video/GetVideosByPlaylistId");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const {
  createBunnyStreamVideoService,
  updateBunnyStreamVideoService,
  getBunnyStreamVideoService,
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
} = require("../services/VideoService");
const { default: mongoose } = require("mongoose");
const {
  deleteFile,
  checkFileSuccess,
  changeFileName,
  removeFileName,
  replaceTsSegmentLinksInM3u8,
  convertMp4ToHls,
} = require("../middlewares/storeFile");
const DeleteVideoDto = require("../dtos/Video/DeleteVideoDto");
const { sendMessageToQueue } = require("../utils/rabbitMq");
const CreateVideoDto = require("../dtos/Video/CreateVideoDto");
require("dotenv").config();
const getLogger = require("../utils/logger");
const logger = getLogger("VIDEO_CONTROLLER");
class VideoController {
  async createVideoController(req, res) {
    try {
      const userId = req.userId;
      const videoFile = req.files.video[0];
      const title = videoFile.originalname;

      const video = await createVideoService(userId, {
        title,
        // bunnyId: bunnyVideo.guid,
        // videoUrl: `https://${process.env.BUNNY_STREAM_CDN_HOST_NAME}/${bunnyVideo.guid}/playlist.m3u8`,
        // videoEmbedUrl: `https://iframe.mediadelivery.net/embed/${process.env.BUNNY_STREAM_VIDEO_LIBRARY_ID}/${bunnyVideo.guid}`,
        // thumbnailUrl: `https://${process.env.BUNNY_STREAM_CDN_HOST_NAME}/${bunnyVideo.guid}/thumbnail.jpg`,
      });

      if (!video) {
        logger.error("Create video failed");
        throw new CoreException(
          StatusCodeEnums.InternalServerError_500,
          "Create video failed"
        );
      }

      const newFilePath = await changeFileName(videoFile.path, video._id);
      const m3u8 = await convertMp4ToHls(newFilePath);
      const folderPath = await removeFileName(newFilePath);
      await replaceTsSegmentLinksInM3u8(m3u8, video._id);
      await deleteFile(newFilePath);

      const queueMessage = {
        userId: userId,
        videoId: video._id,
        videoFolderPath: folderPath,
      };

      await sendMessageToQueue(
        process.env.RABBITMQ_UPLOAD_VIDEO_QUEUE,
        queueMessage
      );

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ video, message: "Success" });
    } catch (error) {
      // if (req.files) {
      //   await deleteFile(req.files.video[0].path);
      // }
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
      if (req.files && req.files.videoThumbnail) {
        await checkFileSuccess(thumbnailFile.path);
      }

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
    const requester = req.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Valid user ID is required" });
    }

    try {
      const videos = await getVideosByUserIdService(userId, sortBy, requester);

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
    const requester = req.userId;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId, requester)) {
      return res
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Valid video ID is required" });
    }

    try {
      const video = await getVideoService(videoId, requester);
      const bunnyVideo = await getBunnyStreamVideoService(
        process.env.BUNNY_STREAM_VIDEO_LIBRARY_ID,
        video.bunnyId
      );

      const result = {
        video,
        bunnyVideo,
      };

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Success", result });
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
      const requester = req.userId;
      const getVideosByPlaylistId = new GetVideosByPlaylistIdDto(
        playlistId,
        page,
        size,
        requester
      );
      await getVideosByPlaylistId.validate();

      const videos = await getVideosByPlaylistIdService(
        playlistId,
        page || 1,
        size || 10,
        requester
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
