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

  async getVideosByUserIdRepository(userId, sortBy) {
    try {
      let videos;
      if (sortBy && sortBy === "like") {
        videos = await Video.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(userId),
              isDeleted: false,
            },
          },
          {
            $addFields: {
              length: {
                $size: "$likedBy",
              },
            },
          },
          {
            $sort: {
              length: -1,
              dateCreated: -1,
            },
          },
          {
            $project: {
              length: 0,
            },
          },
        ]);
      } else {
        videos = await Video.find({
          userId: userId,
          isDeleted: false,
        }).sort({ dateCreated: -1 });
      }

      return videos;
    } catch (error) {
      throw new Error(
        `Error when fetch all videos by userId: ${error.message}`
      );
    }
  }

  async getVideoByIdRepository(videoId) {
    try {
      const video = await Video.findOne({ _id: videoId, isDeleted: false });
      return video;
    } catch (error) {
      throw new Error(`Error when fetching video by videoId: ${error.message}`);
    }
  }

  async getVideosByPlaylistIdRepository(playlistId, page, size) {
    try {
      console.log(page);
      const playlist = await MyPlaylist.findById(playlistId);
      if (!playlist) {
        throw new Error("Playlist not found");
      }
      const videoIds = playlist.videoIds.map((video) => video.toString());

      const skip = (page - 1) * size;
      const videos = await Video.find({ _id: { $in: videoIds } })
        .skip(skip)
        .limit(size);

      return {
        data: videos,
        page: page,
        total: videos.length,
        totalPages: Math.ceil(videos.length / size),
      };
    } catch (error) {
      throw new Error(
        `Error when fetch all videos by playlistId: ${error.message}`
      );
    }
  }
  async getAllVideosRepository(query) {
    try {
      const skip = (query.page - 1) * query.size;

      const searchQuery = { isDeleted: false };

      if (query.title) {
        searchQuery.title = query.title;
      }

      const totalVideos = await Video.countDocuments(searchQuery);
      let videos;
      if (query.sortBy && query.sortBy === "like") {
        videos = await Video.aggregate([
          {
            $match: {
              isDeleted: false,
            },
          },
          {
            $addFields: {
              length: {
                $size: "$likedBy",
              },
            },
          },
          {
            $sort: {
              length: -1,
              dateCreated: -1,
            },
          },
        ])
          .skip(skip)
          .limit(+query.size);
      } else {
        videos = await Video.find(searchQuery)
          .sort({ dateCreated: -1 })
          .limit(query.size)
          .skip(skip);
      }

      return {
        videos,
        total: totalVideos,
        page: query.page,
        totalPages: Math.ceil(totalVideos / query.size),
      };
    } catch (error) {
      throw new Error(`Error when fetching all videos: ${error.message}`);
    }
  }
}

module.exports = VideoRepository;
