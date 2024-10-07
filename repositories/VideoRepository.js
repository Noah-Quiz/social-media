const Video = require("../entities/VideoEntity");

class VideoRepository {
  async createVideoRepository(videoData, session) {
    try {
      const video = await Video.create([videoData], { session });
      return video[0];
    } catch (error) {
      throw new Error(`Error when creating user: ${error.message}`);
    }
  }

  async findUserByEmail(email) {
    try {
      const user = await Video.findOne({ email });
      return user;
    } catch (error) {
      throw new Error(`Error when finding user by email: ${error.message}`);
    }
  }

  async updateAVideoByIdRepository(videoId, data) {
    try {
      await Video.findByIdAndUpdate(videoId, data);
      const video = await Video.findById(videoId);
      return video;
    } catch (error) {
      throw new Error(`Error when update video: ${error.message}`);
    }
  }
}

module.exports = VideoRepository;
