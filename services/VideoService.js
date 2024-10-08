const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { validEmail, validPassword } = require("../utils/validator");
const axios = require("axios");
const createVideoService = async (
  userId,
  { title, description, videoUrl, enumMode, thumbNailUrl, categoryIds }
) => {
  try {
    const connection = new DatabaseTransaction();

    let categoryObjectIds = [];

    if (typeof categoryIds === 'string') {
      categoryObjectIds = categoryIds
        .replace(/[\[\]\s]/g, '')
        .split(',')
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id));
    }

    const video = await connection.videoRepository.createVideoRepository({
      userId,
      title,
      description,
      videoUrl,
      enumMode,
      thumbNailUrl,
      categoryIds: categoryObjectIds,
    });

    return video;
  } catch (error) {
    throw new Error(`Error when signing up: ${error.message}`);
  }
};

const updateAVideoByIdService = async (videoId, data) => {
  const connection = new DatabaseTransaction();
  try {
    const video = await connection.videoRepository.updateAVideoByIdRepository(
      videoId,
      data
    );
    return video;
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
    throw new Error(`Error in get videos by userId ${error.message}`);
  }
};

const deleteVideo = async (id, userId) => {
  const connection = new DatabaseTransaction();

  try {
    const session = await connection.startTransaction();

    const video = await connection.videoRepository.getVideoRepository(
      id,
      session
    );

    if (!video) {
      throw new Error(`No video found for id: ${id}`);
    }

    if (video.userId.toString() !== userId) {
      throw new Error("You are not the owner of this video.");
    }
    const videoId = video.videoUrl.split("/").pop();

    const response = await axios.delete(
      `https://api.vimeo.com/videos/${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`, // assuming the token is stored in env variables
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
    // Abort the transaction in case of an error
    await connection.abortTransaction();
    throw new Error(`Error when deleting video: ${error.message}`);
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
  deleteVideo,
};
