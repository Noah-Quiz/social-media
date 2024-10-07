const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { validEmail, validPassword } = require("../utils/validator");

const createVideoService = async (
  userId,
  { title, description, videoUrl, enumMode, thumbNailUrl, categoryIds }
) => {
  try {
    const connection = new DatabaseTransaction();

    // Chuyển đổi từng giá trị của categoryIds thành ObjectId
    const categoryObjectIds = categoryIds.map((id) =>
      mongoose.Types.ObjectId(id)
    );

    const video = await connection.videoRepository.createVideoRepository({
      userId,
      title,
      description,
      videoUrl,
      enumMode,
      thumbNailUrl,
      categoryIds: categoryObjectIds, // sử dụng ObjectId đúng cách
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
module.exports = { createVideoService, updateAVideoByIdService };
