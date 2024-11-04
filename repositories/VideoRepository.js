const Video = require("../entities/VideoEntity");
const MyPlaylist = require("../entities/MyPlaylistEntity");
const mongoose = require("mongoose");
const User = require("../entities/UserEntity");

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

  //userId => user, categoryIds => categories
  async getVideoRepository(videoId) {
    try {
      const result = await Video.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(videoId),
            isDeleted: false,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
            pipeline: [
              {
                $project: {
                  fullName: 1,
                  nickName: 1,
                  avatar: 1,
                  _id: 0,
                },
              },
            ],
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "categories",
            localField: "categoryIds",
            foreignField: "_id",
            as: "categories",
            pipeline: [
              {
                $project: {
                  name: 1,
                  imageUrl: 1,
                  _id: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            merged: {
              $mergeObjects: [
                "$$ROOT",
                {
                  user: {
                    fullName: "$user.fullName",
                    nickName: "$user.nickName",
                    avatar: "$user.avatar",
                  },
                },
              ],
            },
          },
        },
        { $replaceRoot: { newRoot: "$merged" } },
        { $project: { categoryIds: 0, isDeleted: 0, __v: 0, lastUpdated: 0 } }, // Optionally hide categoryIds
      ]);
      return result[0] || null;
    } catch (error) {
      throw new Error(`Error fetching video: ${error.message}`);
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
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    _id: 0,
                    nickName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          { $unwind: "$user" },
          {
            $lookup: {
              from: "categories",
              localField: "categoryIds",
              foreignField: "_id",
              as: "categories",
              pipeline: [
                {
                  $project: {
                    name: 1,
                    imageUrl: 1,
                    _id: 1,
                  },
                },
              ],
            },
          },
          {
            $project: {
              merged: {
                $mergeObjects: [
                  "$$ROOT",
                  {
                    user: {
                      fullName: "$user.fullName",
                      nickName: "$user.nickName",
                      avatar: "$user.avatar",
                    },
                    category: {
                      $map: {
                        input: "$categories",
                        as: "category",
                        in: "$$category.name", // Extract category names
                      },
                    },
                  },
                ],
              },
            },
          },
          { $replaceRoot: { newRoot: "$merged" } },
          {
            $project: { categoryIds: 0, isDeleted: 0, __v: 0, lastUpdated: 0 },
          }, // Optionally hide categoryIds
        ]);
      } else {
        videos = await Video.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(userId),
              isDeleted: false,
            },
          },
          {
            $sort: {
              dateCreated: -1,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    _id: 0,
                    nickName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          { $unwind: "$user" },
          {
            $lookup: {
              from: "categories",
              localField: "categoryIds",
              foreignField: "_id",
              as: "categories",
              pipeline: [
                {
                  $project: {
                    name: 1,
                    imageUrl: 1,
                    _id: 1,
                  },
                },
              ],
            },
          },
          {
            $project: {
              merged: {
                $mergeObjects: [
                  "$$ROOT",
                  {
                    user: {
                      fullName: "$user.fullName",
                      nickName: "$user.nickName",
                      avatar: "$user.avatar",
                    },
                  },
                ],
              },
            },
          },
          { $replaceRoot: { newRoot: "$merged" } },
          {
            $project: { categoryIds: 0, isDeleted: 0, __v: 0, lastUpdated: 0 },
          }, // Optionally hide categoryIds
        ]);
      }

      return videos;
    } catch (error) {
      throw new Error(
        `Error when fetch all videos by userId: ${error.message}`
      );
    }
  }

  //get for view and like increment => no adjust
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
      console.log("Page number:", page);
      const playlist = await MyPlaylist.findById(playlistId);
      if (!playlist) {
        throw new Error("Playlist not found");
      }
      const videoIds = playlist.videoIds.map((video) => video.toString());

      const skip = (page - 1) * size;

      // Fetch video details using getVideoRepository
      const videoPromises = videoIds.map((id) => this.getVideoRepository(id));
      const videos = await Promise.all(videoPromises);

      // Filter out any null results (videos that may not have been found)
      const validVideos = videos.filter((video) => video);

      // Apply pagination
      const paginatedVideos = validVideos.slice(skip, skip + size);

      return {
        data: paginatedVideos,
        page: page,
        total: validVideos.length,
        totalPages: Math.ceil(validVideos.length / size),
      };
    } catch (error) {
      throw new Error(
        `Error when fetching all videos by playlistId: ${error.message}`
      );
    }
  }

  async getAllVideosRepository(query) {
    try {
      const page = query.page || 1;
      const size = parseInt(query.size, 10) || 10;
      const skip = (page - 1) * size;
  
      // Create search query
      const searchQuery = { isDeleted: false, enumMode: "public" };
      if (query.title) searchQuery.title = query.title;
  
      let sortField = "dateCreated"; // Default sort field
      let sortOrder = query.order === "ascending" ? 1 : -1;
      
      if (query.sortBy === "like") sortField = "likesCount";
      else if (query.sortBy === "view") sortField = "currentViewCount";
      else if (query.sortBy === "date") sortField = "dateCreated";
  
      const totalVideos = await Video.countDocuments(searchQuery);
  
      const videos = await Video.aggregate([
        { $match: searchQuery },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "categories",
            localField: "categoryIds",
            foreignField: "_id",
            as: "categories",
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            videoUrl: 1,
            videoEmbedUrl: 1,
            videoServerUrl: 1,
            thumbnailUrl: 1,
            enumMode: 1,
            dateCreated: 1,
            likesCount: { $size: "$likedBy" },
            user: {
              _id: 1,
              fullName: "$user.fullName",
              nickName: "$user.nickName",
              avatar: "$user.avatar",
            },
            categories: {
              $map: {
                input: "$categories",
                as: "category",
                in: {
                  _id: "$$category._id",
                  name: "$$category.name",
                  imageUrl: "$$category.imageUrl",
                },
              },
            },
          },
        },
        { $sort: { [sortField]: sortOrder } },
        { $skip: skip },
        { $limit: Number(size) }
      ]);
  
      // Return paginated results
      return {
        videos,
        total: totalVideos,
        page: Number(page),
        totalPages: Math.ceil(totalVideos / Number(size)),
      };
    } catch (error) {
      throw new Error(`Error when fetching all videos: ${error.message}`);
    }
  }
  

  async countTotalVideosRepository() {
    return await Video.countDocuments({ isDeleted: false });
  }

  async countTodayVideosRepository() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    return await Video.countDocuments({
      isDeleted: false,
      dateCreated: {
        $gte: new Date(currentYear, currentMonth - 1, now.getDate()),
        $lt: new Date(currentYear, currentMonth - 1, now.getDate() + 1),
      },
    });
  }

  async countThisWeekVideosRepository() {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const videosThisWeek = await Video.countDocuments({
      isDeleted: false,
      dateCreated: { $gte: weekStart },
    });
    return videosThisWeek;
  }

  async countThisMonthVideosRepository() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const videosThisMonth = await Video.countDocuments({
      isDeleted: false,
      dateCreated: {
        $gte: new Date(currentYear, currentMonth - 1, 1),
        $lt: new Date(currentYear, currentMonth, 1),
      },
    });
    return videosThisMonth;
  }

  async countMonthlyVideosRepository() {
    const videosMonthly = await Video.aggregate([
      {
        $match: { isDeleted: false },
      },
      {
        $group: {
          _id: {
            year: { $year: "$dateCreated" },
            month: { $month: "$dateCreated" },
          },
          videoCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    return videosMonthly;
  }
}

module.exports = VideoRepository;
