const GetVideosByPlaylistIdDto = require("../dtos/Video/GetVideosByPlaylistId");
const path = require("path");
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
  findClosetTsFile,
  createThumbnailFromTsFile,
  deleteFolder,
} = require("../middlewares/storeFile");
const DeleteVideoDto = require("../dtos/Video/DeleteVideoDto");
const { sendMessageToQueue } = require("../utils/rabbitMq");
const CreateVideoDto = require("../dtos/Video/CreateVideoDto");
require("dotenv").config();
const getLogger = require("../utils/logger");
const UpdateVideoDto = require("../dtos/Video/UpdateVideoDto");
const logger = getLogger("VIDEO_CONTROLLER");
class VideoController {
  async createVideoController(req, res, next) {
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
        throw new CoreException(
          StatusCodeEnums.InternalServerError_500,
          "Create video failed"
        );
      }

      const newFilePath = await changeFileName(videoFile.path, video._id);
      const m3u8 = await convertMp4ToHls(newFilePath);
      const folderPath = await removeFileName(newFilePath);
      try {
        await replaceTsSegmentLinksInM3u8(m3u8, video._id);
        const closestTsFile = await findClosetTsFile(folderPath);
        const thumbnail = await createThumbnailFromTsFile(
          path.join(folderPath, closestTsFile.selectedFile.file),
          folderPath
        );
        await deleteFile(newFilePath);

        await updateAVideoByIdService(video._id, {
          duration: closestTsFile.duration,
        });
      } catch (error) {
        await deleteFolder(folderPath);
        throw error;
      }

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
      next(error);
    }
  }

  async toggleLikeVideoController(req, res, next) {
    try {
      const { videoId } = req.params;
      const { action } = req.query;
      const userId = req.userId;

      if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Valid video ID is required"
        );
      }

      await toggleLikeVideoService(videoId, userId, action);

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async viewIncrementController(req, res, next) {
    try {
      const { videoId } = req.params;

      if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new CoreException(
          StatusCodes.BadRequest_400,
          "Valid video ID is required"
        );
      }

      const video = await viewIncrementService(videoId);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ video: video, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async updateAVideoByIdController(req, res, next) {
    try {
      const { videoId } = req.params;

      let thumbnailFile = null;
      if (req.files && req.files.videoThumbnail) {
        thumbnailFile = req.files.videoThumbnail[0];
      }

      const data = req.body;
      //handle category from swagger being string
      if (typeof data.categoryIds === "string") {
        if (data.categoryIds.includes(",")) {
          data.categoryIds = data.categoryIds.split(",").map((id) => id.trim());
        } else {
          data.categoryIds = [data.categoryIds.trim()];
        }
      }
      const updateVideoDto = new UpdateVideoDto(
        videoId,
        data.title,
        data.description,
        data.enumMode,
        data.categoryIds,
        thumbnailFile
      );

      await updateVideoDto.validate();

      const updateData = {
        title: data.title,
        description: data.description,
        enumMode: data.enumMode,
        categoryIds: data.categoryIds,
      };
      if (updateData.categoryIds && updateData.categoryIds.length > 0) {
        updateData.categoryIds = updateData.categoryIds.filter(
          (id) => id !== ""
        );
      }

      // Filter out duplicate category IDs
      if (updateData.categoryIds && updateData.categoryIds.length > 0) {
        updateData.categoryIds = [...new Set(updateData.categoryIds)];
      }
      const video = await updateAVideoByIdService(
        videoId,
        updateData,
        thumbnailFile
      );
      // const bunnyVideo = await updateBunnyStreamVideoService(
      //   process.env.BUNNY_STREAM_VIDEO_LIBRARY_ID,
      //   data.title
      // );
      // if (req.files && req.files.videoThumbnail) {
      //   await checkFileSuccess(thumbnailFile.path);
      // }

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ video, message: "Update video successfully" });
    } catch (error) {
      next(error);
    }
  }

  async deleteVideoController(req, res, next) {
    try {
      const { videoId } = req.params;
      const userId = req.userId;
      const deleteVideoDto = new DeleteVideoDto(videoId, userId);
      await deleteVideoDto.validate();

      const video = await deleteVideoService(videoId, userId);

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async getVideosByUserIdController(req, res, next) {
    try {
      const { userId } = req.params;
      const { sortBy } = req.query;
      const requester = req.userId;
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Valid user ID is required"
        );
      }

      const videos = await getVideosByUserIdService(userId, sortBy, requester);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Success", videos });
    } catch (error) {
      next(error);
    }
  }

  async getVideoController(req, res, next) {
    try {
      const { videoId } = req.params;
      const requester = req.userId;

      if (!videoId || !mongoose.Types.ObjectId.isValid(videoId, requester)) {
        throw new CoreException(
          StatusCodes.BadRequest_400,
          "Valid video ID is required"
        );
      }

      const video = await getVideoService(videoId, requester);
      // const bunnyVideo = await getBunnyStreamVideoService(
      //   process.env.BUNNY_STREAM_VIDEO_LIBRARY_ID,
      //   video.bunnyId
      // );

      const result = {
        video,
      };

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Success", result });
    } catch (error) {
      next(error);
    }
  }

  async getVideosController(req, res, next) {
    try {
      const query = {
        size: req.query.size,
        page: req.query.page,
        status: req.query.status,
        sortBy: req.query.sortBy,
        order: req.query.order,
        title: req.query.title,
      };

      if (!query.page) query.page = 1;
      if (!query.size) query.size = 10;
      const validSortByOptions = ["like", "view", "date"];
      const validOrderOptions = ["ascending", "descending"];
      if (query.sortBy && !validSortByOptions.includes(query.sortBy)) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid query sortBy, must be in ['like', 'view', 'date']"
        );
      }

      if (query.order && !validOrderOptions.includes(query.order)) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid query order, must be in ['ascending', 'descending']"
        );
      }
      if (query.page < 1) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid page number"
        );
      }
      if (query.size < 1) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Size cannot be less than 1"
        );
      }
      if (query.title) {
        query.title = { $regex: query.title, $options: "i" };
      }

      const { videos, total, page, totalPages } = await getVideosService(query);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Success", videos, total, page, totalPages });
    } catch (error) {
      next(error);
    }
  }

  async getVideosByPlaylistIdController(req, res, next) {
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
      next(error);
    }
  }
}

module.exports = VideoController;
