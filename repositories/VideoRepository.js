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

  async viewIncrementRepository(videoId) {
    try {
      const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { numOfViews: 1 } },
        { new: true }
      );

      if (!updatedVideo) {
        throw new Error('Video not found');
      }

      return true;
    } catch (error) {
      throw new Error(`Error when increasing view: ${error.message}`);
    }
  }

  async toggleLikeVideoRepository(videoId, userId, action = 'like') {
    try {
      const updateAction = action === 'like'
        ? { $addToSet: { likedBy: userId } }
        : { $pull: { likedBy: userId } };

      const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        updateAction,
        { new: true }
      );

      if (!updatedVideo) {
        throw new Error("Video not found");
      }

      return true;
    } catch (error) {
      throw new Error(`Error in toggling like/unlike: ${error.message}`);
    }
  }
}

module.exports = VideoRepository;