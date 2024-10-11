const Video = require("../entities/VideoEntity");
const MyPlaylist = require("../entities/MyPlaylistEntity");
const mongoose = require("mongoose");

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
        throw new Error("Video not found");
      }

      return true;
    } catch (error) {
      throw new Error(`Error when increasing view: ${error.message}`);
    }
  }

  async toggleLikeVideoRepository(videoId, userId, action = "like") {
    try {
      const updateAction =
        action === "like"
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

  async updateAVideoByIdRepository(videoId, data) {
    try {
      await Video.findByIdAndUpdate(videoId, data);
      const video = await Video.findById(videoId);
      return video;
    } catch (error) {
      throw new Error(`Error when update video: ${error.message}`);
    }
  }

  async getVideoRepository(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ObjectId");
      }
      const objectId = new mongoose.Types.ObjectId(id);
      const video = await Video.findOne({ _id: objectId });

      return video;
    } catch (error) {
      throw new Error(`Error when getting video: ${error.message}`);
    }
  }
  async deleteVideoRepository(id, session) {
    try {
      const video = await Video.findByIdAndUpdate(
        { _id: id },
        { isDeleted: true, lastUpdated: new Date() },
        { new: true, runValidators: true, session }
      );
      return video;
    } catch (error) {
      throw new Error(`Error when delete video mongodb: ${error.message}`);
    }
  }

  async getVideosByUserIdRepository(userId) {
    try {
      const videos = await Video.find({ userId: userId, isDeleted: false });
      return videos;
    } catch (error) {
      throw new Error(
        `Error when fetch all videos by userId: ${error.message}`
      );
    }
  }

  async getVideosByPlaylistIdRepository(playlistId) {
    try {
      const playlist = await MyPlaylist.findById(playlistId);
      if (!playlist) {
        throw new Error("Playlist not found");
      }
      const videos = playlist.videoIds.map((video) => video.toString());
      return videos;
    } catch (error) {
      throw new Error(
        `Error when fetch all videos by playlistId: ${error.message}`
      );
    }
  }
}

module.exports = VideoRepository;
