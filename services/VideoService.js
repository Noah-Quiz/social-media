const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const { validEmail, validPassword } = require("../utils/validator");

const createVideoService = async (userId, { title, description, videoUrl, enumMode, thumbNailUrl, categoryIds }) => {
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
      categoryIds: categoryObjectIds 
    });

    return video;
  } catch (error) {
    throw new Error(`Error when signing up: ${error.message}`);
  }
};

module.exports = { createVideoService };
