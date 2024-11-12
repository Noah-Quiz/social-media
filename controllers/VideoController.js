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
  getVideoLikeHistoryService,
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
const GetVideosDto = require("../dtos/Video/GetVideosDto");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const UserEnum = require("../enums/UserEnum");
const logger = getLogger("VIDEO_CONTROLLER");
class VideoController {
  async createVideoController(req, res, next) {
    try {
      const userId = req.userId;
      const videoFile = req.files.video[0];
      const title = videoFile.originalname;

      const video = await createVideoService(userId, {
        title,
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

        await updateAVideoByIdService(video._id, userId, {
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
      const userId = req.userId;

      if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Valid video ID is required"
        );
      }

      const action = await toggleLikeVideoService(videoId, userId);

      return res.status(StatusCodeEnums.OK_200).json({
        message: `${
          action?.charAt(0)?.toUpperCase() + action?.slice(1)
        } video successfully`,
      });
    } catch (error) {
      next(error);
    }
  }

  async viewIncrementController(req, res, next) {
    try {
      const { videoId } = req.params;

      if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
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
      const userId = req.userId;
      
      const connection = new DatabaseTransaction();
      const user = await connection.userRepository.getAnUserByIdRepository(
        userId
      );
      if (!user) {
        throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
      }
      const { videoId } = req.params;
      const existVideo =
        await connection.videoRepository.getVideoByIdRepository(videoId);
      if (!existVideo) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Video not found"
        );
      }

      if (user.role !== UserEnum.ADMIN && existVideo.userId !== userId) {
        throw new CoreException(
          StatusCodeEnums.Forbidden_403,
          "You don't have access to perform this action on this video"
        );
      }
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
        data.enumMode?.toLowerCase(),
        data.categoryIds,
        thumbnailFile
      );

      try {
        await updateVideoDto.validate();
      } catch (validationError) {
        // Pass validation errors to Express error-handling middleware
        return next(validationError);
      }

      const updateData = {
        title: data.title,
        description: data.description,
        enumMode: data.enumMode?.toLowerCase() || "public",
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
        userId,
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

      const connection = new DatabaseTransaction();
      const user = await connection.userRepository.getAnUserByIdRepository(
        userId
      );
      if (!user) {
        throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
      }
      const existVideo =
        await connection.videoRepository.getVideoByIdRepository(videoId);
      if (!existVideo) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Video not found"
        );
      }

      if (user.role !== UserEnum.ADMIN && existVideo.userId !== userId) {
        throw new CoreException(
          StatusCodeEnums.Forbidden_403,
          "You don't have access to perform this action on this video"
        );
      }
      const video = await deleteVideoService(videoId, userId);

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async getVideosByUserIdController(req, res, next) {
    try {
      const { userId } = req.params;
      const requesterId = req.requesterId;

      const query = {
        size: req.query.size,
        page: req.query.page,
        title: req.query.title,
        sortBy: req.query.sortBy?.toLowerCase(),
        order: req.query.order?.toLowerCase(),
        enumMode: req.query.enumMode?.toLowerCase(),
      };

      const getVideosDto = new GetVideosDto(
        query.size,
        query.page,
        query.enumMode,
        query.sortBy,
        query.order,
        query.title
      );
      const validatedQuery = await getVideosDto.validate();

      const { videos, total, page, totalPages } =
        await getVideosByUserIdService(userId, validatedQuery, requesterId);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Success", videos, total, page, totalPages });
    } catch (error) {
      next(error);
    }
  }

  async getVideoController(req, res, next) {
    try {
      const { videoId } = req.params;
      const requesterId = req.requesterId;

      const video = await getVideoService(videoId, requesterId);
      // const bunnyVideo = await getBunnyStreamVideoService(
      //   process.env.BUNNY_STREAM_VIDEO_LIBRARY_ID,
      //   video.bunnyId
      // );

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Success", video });
    } catch (error) {
      next(error);
    }
  }

  async getVideosController(req, res, next) {
    try {
      const query = {
        size: req.query.size,
        page: req.query.page,
        title: req.query.title,
        sortBy: req.query.sortBy?.toLowerCase(),
        order: req.query.order?.toLowerCase(),
        enumMode: req.query.enumMode?.toLowerCase(),
      };
      const requesterId = req.requesterId;

      const getVideosDto = new GetVideosDto(
        query.size,
        query.page,
        query.enumMode,
        query.sortBy,
        query.order,
        query.title
      );
      const validatedQuery = await getVideosDto.validate();

      const { videos, total, page, totalPages } = await getVideosService(
        validatedQuery,
        requesterId
      );

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
      const query = {
        size: req.query.size,
        page: req.query.page,
        title: req.query.title,
        sortBy: req.query.sortBy?.toLowerCase(),
        order: req.query.order?.toLowerCase(),
        enumMode: req.query.enumMode?.toLowerCase(),
      };
      const requesterId = req.requesterId;

      const getVideosDto = new GetVideosDto(
        query.size,
        query.page,
        query.enumMode,
        query.sortBy,
        query.order,
        query.title
      );
      const validatedQuery = await getVideosDto.validate();

      const videos = await getVideosByPlaylistIdService(
        playlistId,
        validatedQuery,
        requesterId
      );

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ videos, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async getVideoLikeHistoryController(req, res, next) {
    const userId = req.userId;

    try {
      const videos = await getVideoLikeHistoryService(userId);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ videos, message: "Get videos like history successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = VideoController;
