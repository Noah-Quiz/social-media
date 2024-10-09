const Video = require("../entities/VideoEntity");
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

  async getVideoRepository(videoId) {
    try {
      const video = await Video.findOne({ _id: videoId });

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
      throw new Error(`Error when deleting video: ${error.message}`);
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

  async getAllVideosRepository(query) {
    try {
      const skip = (query.page - 1) * query.limit;
  
      const searchQuery = { isDeleted: false };
  
      if (query.title) {
        searchQuery.title = query.title; 
      }
  
      const totalDocuments = await Video.countDocuments(searchQuery);
  
      const videos = await Video.find(searchQuery)
        .limit(query.limit)
        .skip(skip);
  
      return {
        videos,
        totalDocuments,
        currentPage: query.page,
        totalPages: Math.ceil(totalDocuments / query.limit),
      };
    } catch (error) {
      throw new Error(`Error when fetching all videos: ${error.message}`);
    }
  }
  
}

module.exports = VideoRepository;
