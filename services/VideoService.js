const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const { validEmail, validPassword } = require("../utils/validator");

const createVideoService = async (userId, { title, description, videoUrl, enumMode, thumbNailUrl, categoryIds }) => {
  try {
    const connection = new DatabaseTransaction();

    // Chuyển đổi từng giá trị của categoryIds thành ObjectId
    const categoryObjectIds = categoryIds.map(id => mongoose.Types.ObjectId(id));

    const video = await connection.videoRepository.createVideoRepository({
      userId,
      title,
      description,
      videoUrl,
      enumMode,
      thumbNailUrl,
      categoryIds: categoryObjectIds // sử dụng ObjectId đúng cách
    });

    return video;
  } catch (error) {
    throw new Error(`Error when signing up: ${error.message}`);
  }
};

const toggleLikeVideoService = async (videoId, userId, action) => {
  try {
    const connection = new DatabaseTransaction();

    const allowedActions = ["like", "unlike"];
    if (!allowedActions.includes(action)) {
      throw new Error("Invalid action");
    }

    const result = await connection.videoRepository.toggleLikeVideoRepository(videoId, userId, action);
    
    return result;
  } catch (error) {
    throw new Error(`Error in toggling like/unlike: ${error.message}`);
  }
}

const viewIncrementService = async (videoId) => {
  try {
    const connection = new DatabaseTransaction();

    const result = await connection.videoRepository.viewIncrementRepository(videoId);

    return result;
  } catch (error) {
    throw new Error(`Error in increasing view: ${error.message}`);
  }
}

module.exports = {
  createVideoService,
  toggleLikeVideoService,
  viewIncrementService,
};
