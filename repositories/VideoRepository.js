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
        { $project: { categoryIds: 0 } }, // Optionally hide categoryIds
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
          { $project: { categoryIds: 0 } }, // Optionally hide categoryIds
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
          { $project: { categoryIds: 0 } }, // Optionally hide categoryIds
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
      console.log(videoIds);
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
      const skip = (query.page - 1) * +query.size; // Ensure query.size is a number

      const searchQuery = { isDeleted: false };

      if (query.title) {
        searchQuery.title = { $regex: query.title, $options: "i" }; // Allow title search with case-insensitive regex
      }

      const totalVideos = await Video.countDocuments(searchQuery); // Count total documents based on search

      let sortCondition;
      if (query.sortBy && query.sortBy === "like") {
        // Sort by likes
        sortCondition = {
          length: -1, // Sort by number of likes
          dateCreated: -1, // Sort by creation date as a secondary sort
        };
      } else {
        // Sort by dateCreated only
        sortCondition = { dateCreated: -1 };
      }

      const videos = await Video.aggregate([
        {
          $match: {
            isDeleted: false,
            ...(query.title
              ? { title: { $regex: query.title, $options: "i" } }
              : {}), // Add title condition if exists
          },
        },
        ...(query.sortBy && query.sortBy === "like"
          ? [
              {
                $addFields: {
                  length: {
                    $size: "$likedBy", // Add field to count likes
                  },
                },
              },
            ]
          : []), // Add field for sorting by likes if needed
        {
          $sort: sortCondition, // Dynamic sorting condition based on query
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
        { $project: { categoryIds: 0 } }, // Optionally hide categoryIds
        { $skip: skip }, // Apply skip for pagination
        { $limit: +query.size }, // Apply limit for pagination
      ]);

      return {
        videos,
        total: totalVideos,
        page: query.page,
        totalPages: Math.ceil(totalVideos / +query.size),
      };
    } catch (error) {
      throw new Error(`Error when fetching all videos: ${error.message}`);
    }
  }
}

module.exports = VideoRepository;
