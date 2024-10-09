const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { validEmail, validPassword } = require("../utils/validator");
const axios = require("axios");
const { uploadThumbnail } = require("../middlewares/LoadFile");

const createVideoService = async (
  userId,
  { title, description, videoUrl, embedUrl, enumMode, thumbnailUrl, categoryIds }
) => {
  try {
    const connection = new DatabaseTransaction();
    
    if (categoryIds && !Array.isArray(categoryIds)) {
      throw new Error('CategoryIds must be an array');
    }
    if (categoryIds && categoryIds.length !== 0) {
      categoryIds.forEach(id => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error(`Invalid category ID: ${id}. Cannot add`);
        }
      })
    }

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
    throw new Error(`Error when signing up: ${error.message}`);
  }
};

const updateAVideoByIdService = async (videoId, data, thumbnailFile) => {
  try {
    const connection = new DatabaseTransaction();

    const categoryIds = data.categoryIds;
    
    if (categoryIds && !Array.isArray(categoryIds)) {
      throw new Error('CategoryIds must be an array');
    }
    if (categoryIds && categoryIds.length !== 0) {
      categoryIds.forEach(id => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error(`Invalid category ID: ${id}. Cannot add`);
        }
      })
    }

    const video = await connection.videoRepository.getVideoRepository(videoId);
    if (!video) {
      throw new Error("Video not found")
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
    throw new Error(`Error when update a video: ${error.message}`);
  }
};
const toggleLikeVideoService = async (videoId, userId, action) => {
  try {
    const connection = new DatabaseTransaction();

    const allowedActions = ["like", "unlike"];
    if (!allowedActions.includes(action)) {
      throw new Error("Invalid action");
    }

    const result = await connection.videoRepository.toggleLikeVideoRepository(
      videoId,
      userId,
      action
    );

    return result;
  } catch (error) {
    throw new Error(`Error in toggling like/unlike: ${error.message}`);
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
    throw new Error(`Error in increasing view: ${error.message}`);
  }
};

const getVideosByUserIdService = async (userId) => {
  const connection = new DatabaseTransaction();
  try {
    const videos = await connection.videoRepository.getVideosByUserIdRepository(
      userId
    );
    return videos;
  } catch (error) {
    throw new Error(`Error getting video: ${error.message}`);
  }
};

const getVideoService = async (userId) => {
  try {
    const connection = new DatabaseTransaction();

    const video = await connection.videoRepository.getVideoRepository(userId);

    return video;
  } catch (error) {
    throw new Error(`Error getting video: ${error.message}`);
  }
};

const getVideosService = async (query) => {
  try {
    const connection = new DatabaseTransaction();

    const { videos, totalDocuments, currentPage, totalPages } = await connection.videoRepository.getAllVideosRepository(query);

    return { videos, totalDocuments, currentPage, totalPages };
  } catch (error) {
    throw new Error(`Error getting video: ${error.message}`);
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

    if (!video) {
      throw new Error(`No video found`);
    }

    if (video.userId.toString() !== userId) {
      throw new Error("You are not the owner of this video.");
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
      throw new Error("Failed to delete video on Vimeo.");
    }

    const repo = await connection.videoRepository.deleteVideoRepository(
      video._id,
      session
    );

    if (!repo) {
      throw new Error("Failed to delete video in the database.");
    }

    await connection.commitTransaction();

    return repo;
  } catch (error) {
    await connection.abortTransaction();
    throw new Error(
      `Error when deleting video service layer: ${error.message}`
    );
  }
};

module.exports = {
  createVideoService,
  updateAVideoByIdService,
  createVideoService,
  updateAVideoByIdService,
  toggleLikeVideoService,
  getVideosByUserIdService,
  viewIncrementService,
  deleteVideoService,
  getVideoService,
  getVideosService,
};
