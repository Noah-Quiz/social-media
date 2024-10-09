const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { validEmail, validPassword } = require("../utils/validator");
const axios = require("axios");

const createVideoService = async (
  userId,
  { title, description, videoUrl, embedUrl, enumMode, thumbnailUrl, categoryIds }
) => {
  try {
    const connection = new DatabaseTransaction();

    let categoryObjectIds = [];

    if (typeof categoryIds === "string") {
      categoryObjectIds = categoryIds
        .replace(/[\[\]\s]/g, "")
        .split(",")
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
    }

    const video = await connection.videoRepository.createVideoRepository({
      userId,
      title,
      description,
      categoryIds: categoryObjectIds,
      enumMode,
      videoUrl,
      embedUrl,
      thumbnailUrl,
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

    // Log the ID being searched for
    console.log(`Attempting to find video with ID: ${id}`);

    const video = await connection.videoRepository.getVideoRepository(
      id,
      session
    );
    console.log(video);
    if (!video) {
      throw new Error(`No video found for id: ${id}`);
    }

    if (video.userId.toString() !== userId) {
      throw new Error("You are not the owner of this video.");
    }

    const videoId = video.videoUrl.split("/").pop();

    // Log the Vimeo video ID being deleted
    console.log(`Attempting to delete Vimeo video with ID: ${videoId}`);

    const response = await axios.delete(
      `https://api.vimeo.com/videos/${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`,
        },
      }
    );
    console.log(response);
    // Log Vimeo response
    console.log(`Vimeo delete response status: ${response.status}`);

    if (response.status !== 204) {
      throw new Error("Failed to delete video on Vimeo.");
    }

    // Log the database delete operation
    console.log(
      `Attempting to soft-delete video with ID: ${video._id} from the database`
    );

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
  deleteVideo,
};
