const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { uploadThumbnail, uploadFiles } = require("../middlewares/LoadFile");
const CoreException = require("../exceptions/CoreException");
const StatusCodeEnums = require("../enums/StatusCodeEnum");

const createVideoService = async (
  userId, videoFile, thumbnailFile,
  { title, description, enumMode, categoryIds }
) => {
  try {
    if (["public", "private", "unlisted"].includes(enumMode)) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, 'Invalid video accessibility');
    }
    
    if (categoryIds && !Array.isArray(categoryIds)) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, 'CategoryIds must be an array');
    }
    if (categoryIds && categoryIds.length !== 0) {
      categoryIds.forEach(id => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new CoreException(StatusCodeEnums.BadRequest_400, `Invalid category ID`);
        }
      })
    }

    const connection = new DatabaseTransaction();

    const { videoUrl, embedUrl, thumbnailUrl } = await uploadFiles(videoFile, thumbnailFile);

    const video = await connection.videoRepository.createVideoRepository({
      userId,
      title,
      description,
      categoryIds,
      enumMode,
      videoUrl,
      embedUrl,
      thumbnailUrl,
    });

    return video;
  } catch (error) {
    throw error;
  }
};

const updateAVideoByIdService = async (videoId, data, thumbnailFile) => {
  try {
    if (!["public", "private", "unlisted"].includes(data.enumMode)) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, 'Invalid video accessibility');
    }
    
    const categoryIds = data.categoryIds;
    if (categoryIds && !Array.isArray(categoryIds)) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, 'CategoryIds must be an array');
    }
    if (categoryIds && categoryIds.length !== 0) {
      categoryIds.forEach(id => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new CoreException(StatusCodeEnums.BadRequest_400, `Invalid category ID`);
        }
      })
    }

    const connection = new DatabaseTransaction();

    const video = await connection.videoRepository.getVideoRepository(videoId);
    if (!video) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found")
    }

    if (thumbnailFile && thumbnailFile.buffer) {
      const vimeoVideoId = video.videoUrl.split("/").pop();
      const thumbnailUrl = await uploadThumbnail(`/videos/${vimeoVideoId}`, thumbnailFile);
      data.thumbnailUrl = thumbnailUrl;
    }

    const updatedVideo = await connection.videoRepository.updateAVideoByIdRepository(
      videoId,
      data
    );

    return updatedVideo;
  } catch (error) {
    throw error;
  }
};
const toggleLikeVideoService = async (videoId, userId, action) => {
  try {
    const connection = new DatabaseTransaction();

    const video = await connection.videoRepository.getVideoByIdRepository(videoId);
    
    if (!video) {
      throw new CoreException(StatusCodeEnum.NotFound_404, "Video not found");
    }

    const videoOwnerId = video.userId;

    const allowedActions = ["like", "unlike"];
    if (!allowedActions.includes(action)) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "Invalid action");
    }

    const result = await connection.videoRepository.toggleLikeVideoRepository(
      videoId,
      userId,
      action
    );

    const user = await connection.userRepository.findUserById(userId);

    const notification = {
      avatar: user.avatar,
      content: `${user.fullName} đã like video của bạn`,
      check: videoId,
      seen: false,
      createdAt: new Date(),
    }

    await connection.userRepository.notifiLikeVideoRepository(videoOwnerId, notification);

    return result;
  } catch (error) {
    throw error;
  }
};

const viewIncrementService = async (videoId) => {
  try {
    const connection = new DatabaseTransaction();

    const result = await connection.videoRepository.viewIncrementRepository(
      videoId
    );

    return result;
  } catch (error) {
    throw error;
  }
};

const getVideosByUserIdService = async (userId) => {
  try {
    const connection = new DatabaseTransaction();

    const videos = await connection.videoRepository.getVideosByUserIdRepository(userId);
    
    return videos;
  } catch (error) {
    throw error;
  }
};

const getVideoService = async (userId) => {
  try {
    const connection = new DatabaseTransaction();

    const video = await connection.videoRepository.getVideoRepository(userId);

    return video;
  } catch (error) {
    throw error;
  }
};

const getVideosService = async (query) => {
  try {
    const connection = new DatabaseTransaction();

    const { videos, total, page, totalPages} = await connection.videoRepository.getAllVideosRepository(query);

    return { videos, total, page, totalPages };
  } catch (error) {
    throw error;
  }
};

const getVideosByPlaylistIdService = async (playlistId, page, size) => {
  try {
    const connection = new DatabaseTransaction();
    const videos =
      await connection.videoRepository.getVideosByPlaylistIdRepository(
        playlistId,page,size
      );
    return videos;
  } catch (error) {
    throw error;
  }
};

const deleteVideoService = async (videoId, userId) => {
  const connection = new DatabaseTransaction();

  try {
    const session = await connection.startTransaction();

    const video = await connection.videoRepository.getVideoRepository(
      videoId,
      session
    );

    if (!video || video.isDeleted === true) {
      throw new CoreException(StatusCodeEnums.NotFound_404, `Video not found`);
    }

    if (video.userId.toString() !== userId) {
      throw new CoreException(StatusCodeEnums.Forbidden_403, "You do not have permission to perform this action");
    }

    let vimeoVideoId = video.videoUrl.split("/").pop();
    const response = await axios.delete(
      `https://api.vimeo.com/videos/${vimeoVideoId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`,
        },
      }
    );

    if (response.status !== 204) {
      throw new CoreException(StatusCodeEnums.NoContent_204, "Failed to delete video on Vimeo. Video not found");
    }

    const result = await connection.videoRepository.deleteVideoRepository(
      video._id,
      session
    );

    if (result.deletedCount = 0) {
      throw new CoreException(StatusCodeEnums.NoContent_204, "Failed to delete video. Video not found");
    }

    await connection.commitTransaction();

    return result;
  } catch (error) {
    await connection.abortTransaction();
    throw error;
  }
};

module.exports = {
  createVideoService,
  updateAVideoByIdService,
  createVideoService,
  updateAVideoByIdService,
  toggleLikeVideoService,
  getVideosByUserIdService,
  getVideosByPlaylistIdService,
  viewIncrementService,
  deleteVideoService,
  getVideoService,
  getVideosService,
};
