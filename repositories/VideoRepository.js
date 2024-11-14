const Video = require("../entities/VideoEntity");
const MyPlaylist = require("../entities/MyPlaylistEntity");
const mongoose = require("mongoose");
const User = require("../entities/UserEntity");
const VideoLikeHistory = require("../entities/VideoLikeHistoryEntity");

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

  async toggleLikeVideoRepository(videoId, userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const videoObjectId = new mongoose.Types.ObjectId(videoId);
    let action = "unlike";
  
    try {
      const videoLike = await VideoLikeHistory.findOneAndDelete({
        user: userObjectId,
        video: videoObjectId,
      });
  
      if (!videoLike) {
        action = "like";
        await VideoLikeHistory.create({
          user: userObjectId,
          video: videoObjectId,
        });
      }
  
      return action;
    } catch (error) {
      throw new Error(`Failed to ${action} video: ${error.message}`);
    }
  }
  

  async updateAVideoByIdRepository(videoId, data) {
    try {
      data.lastUpdated = Date.now();

      const video = await Video.findByIdAndUpdate(videoId, data, { new: true });
      
      return video;
    } catch (error) {
      throw new Error(`Error when update video: ${error.message}`);
    }
  }

  async getVideoRepository(videoId, requesterId) {
    try {
        if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new Error("Invalid videoId format");
    }
    if (!mongoose.Types.ObjectId.isValid(requesterId)) {
      console.log(requesterId);
      throw new Error("Invalid requesterId format");
    }

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
          $lookup: {
            from: "videolikehistories",
            let: { videoId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$video", "$$videoId"] } } },
              { $count: "likesCount" }
            ],
            as: "likesInfo",
          },
        },
        {
          $lookup: {
            from: "videolikehistories",
            let: { videoId: "$_id", requester: new mongoose.Types.ObjectId(requesterId) },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$video", "$$videoId"] },
                      { $eq: ["$user", "$$requester"] },
                    ],
                  },
                },
              },
              { $project: { _id: 1 } },
            ],
            as: "userLike",
          },
        },
        {
          $lookup: {
            from: "comments",
            let: { videoId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$videoId", "$$videoId"] } } },
              { $count: "commentsCount" },
            ],
            as: "commentsInfo",
          },
        },
        {
          $addFields: {
            likesCount: { $ifNull: [{ $arrayElemAt: ["$likesInfo.likesCount", 0] }, 0] },
            isLiked: { $gt: [{ $size: "$userLike" }, 0] },
            commentsCount: { $ifNull: [{ $arrayElemAt: ["$commentsInfo.commentsCount", 0] }, 0] },
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
            lastUpdated: 1,
            numOfViews: 1,
            likesCount: 1,
            commentsCount: 1,
            isLiked: 1,
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
        { $project: { categoryIds: 0, isDeleted: 0, __v: 0 } },
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

  async getVideosByUserIdRepository(userId, query, requesterId) {
    try {
      const page = query.page || 1;
      const size = parseInt(query.size, 10) || 10;
      const skip = (page - 1) * size;
  
      // Create search query
      const searchQuery = {
        isDeleted: false,
        userId: new mongoose.Types.ObjectId(userId),
      };
      if (query.title) {
        searchQuery.title = { $regex: new RegExp(query.title, "i") };
      }
      if (query.enumMode) {
        searchQuery.enumMode = query.enumMode;
      }
  
      let sortField = "dateCreated"; // Default sort field
      let sortOrder = query.order === "ascending" ? 1 : -1;
  
      if (query.sortBy === "like") sortField = "likesCount";
      else if (query.sortBy === "view") sortField = "currentViewCount";
      else if (query.sortBy === "date") sortField = "dateCreated";
  
      const totalVideos = await Video.countDocuments(searchQuery);
  
      const videos = await Video.aggregate([
        {
          $match: searchQuery,
        },
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
          $lookup: {
            from: "videolikehistories",
            let: { videoId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$video", "$$videoId"] } } },
              { $count: "likesCount" },
            ],
            as: "likesInfo",
          },
        },
        {
          $lookup: {
            from: "videolikehistories",
            let: { videoId: "$_id", requester: new mongoose.Types.ObjectId(requesterId) },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$video", "$$videoId"] },
                      { $eq: ["$user", "$$requester"] },
                    ],
                  },
                },
              },
              { $project: { _id: 1 } },
            ],
            as: "userLike",
          },
        },
        {
          $lookup: {
            from: "comments",
            let: { videoId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$videoId", "$$videoId"] } } },
              { $count: "commentsCount" },
            ],
            as: "commentsInfo",
          },
        },
        {
          $addFields: {
            likesCount: { $ifNull: [{ $arrayElemAt: ["$likesInfo.likesCount", 0] }, 0] },
            isLiked: { $gt: [{ $size: "$userLike" }, 0] },
            commentsCount: { $ifNull: [{ $arrayElemAt: ["$commentsInfo.commentsCount", 0] }, 0] },
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            videoUrl: 1,
            thumbnailUrl: 1,
            enumMode: 1,
            dateCreated: 1,
            lastUpdated: 1,
            numOfViews: 1,
            likesCount: 1,
            commentsCount: 1,
            isLiked: 1,
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
        { $limit: Number(size) },
      ]);
  
      return {
        videos,
        total: totalVideos,
        page: Number(page),
        totalPages: Math.ceil(totalVideos / Number(size)),
      };
    } catch (error) {
      throw new Error(`Error when fetching all videos by user ID: ${error.message}`);
    }
  }
  

  // Get video with no field adjustment
  async getVideoByIdRepository(videoId) {
    try {
      const video = await Video.findOne({ _id: videoId, isDeleted: false });
      return video;
    } catch (error) {
      throw new Error(`Error when fetching video by videoId: ${error.message}`);
    }
  }

  async getVideosByPlaylistIdRepository(playlistId, query, requesterId) {
    try {
      // Retrieve playlist
      const playlist = await MyPlaylist.findById(playlistId).select("videoIds");
      if (!playlist) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Playlist not found"
        );
      }
  
      // Extract videoIds from playlist
      const videoIds = playlist.videoIds;

      if (!videoIds || videoIds.length === 0) {
        return {
          videos: [],
          total: 0,
          page: query.page || 1,
          totalPages: 1,
        };
      }
  
      // Pagination setup
      const page = query.page || 1;
      const size = parseInt(query.size, 10) || 10;
      const skip = (page - 1) * size;
  
      // Create search query for videos
      const searchQuery = {
        _id: { $in: videoIds },
        isDeleted: false,
      };
  
      // Filter by title if provided
      if (query.title) {
        searchQuery.title = { $regex: new RegExp(query.title, "i") };
      }
  
      // Filter by enumMode if provided
      if (query.enumMode) {
        searchQuery.enumMode = query.enumMode;
      }
  
      // Sorting logic
      let sortField = "dateCreated"; // Default sort field
      let sortOrder = query.order === "ascending" ? 1 : -1;
  
      if (query.sortBy === "like") sortField = "likesCount";
      else if (query.sortBy === "view") sortField = "currentViewCount";
      else if (query.sortBy === "date") sortField = "dateCreated";
  
      // Total video count
      const totalVideos = await Video.countDocuments(searchQuery);
  
      // Fetch videos with aggregation for additional info
      const videos = await Video.aggregate([
        {
          $match: searchQuery,
        },
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
          $lookup: {
            from: "videolikehistories",
            let: { videoId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$video", "$$videoId"] } } },
              { $count: "likesCount" },
            ],
            as: "likesInfo",
          },
        },
        {
          $lookup: {
            from: "videolikehistories",
            let: { videoId: "$_id", requester: new mongoose.Types.ObjectId(requesterId) },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$video", "$$videoId"] },
                      { $eq: ["$user", "$$requester"] },
                    ],
                  },
                },
              },
              { $project: { _id: 1 } },
            ],
            as: "userLike",
          },
        },
        {
          $lookup: {
            from: "comments",
            let: { videoId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$videoId", "$$videoId"] } } },
              { $count: "commentsCount" },
            ],
            as: "commentsInfo",
          },
        },
        {
          $addFields: {
            likesCount: { $ifNull: [{ $arrayElemAt: ["$likesInfo.likesCount", 0] }, 0] },
            isLiked: { $gt: [{ $size: "$userLike" }, 0] },
            commentsCount: { $ifNull: [{ $arrayElemAt: ["$commentsInfo.commentsCount", 0] }, 0] },
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            videoUrl: 1,
            thumbnailUrl: 1,
            enumMode: 1,
            dateCreated: 1,
            lastUpdated: 1,
            numOfViews: 1,
            likesCount: 1,
            commentsCount: 1,
            isLiked: 1,
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
        { $limit: size },
      ]);
  
      return {
        videos,
        total: totalVideos,
        page: Number(page),
        totalPages: Math.ceil(totalVideos / size),
      };
    } catch (error) {
      throw new Error(
        `Error when fetching videos by playlist ID: ${error.message}`
      );
    }
  }

  async getAllVideosRepository(query, requesterId) {
    try {
      const page = query.page || 1;
      const size = parseInt(query.size, 10) || 10;
      const skip = (page - 1) * size;

      // Create search query
      const searchQuery = {
        isDeleted: false,
      };
      if (query.title) {
        searchQuery.title = { $regex: new RegExp(query.title, "i") };
      }
      if (query.enumMode) {
        searchQuery.enumMode = query.enumMode;
      }

      let sortField = "dateCreated"; // Default sort field
      let sortOrder = query.order === "ascending" ? 1 : -1;

      if (query.sortBy === "like") sortField = "likesCount";
      else if (query.sortBy === "view") sortField = "currentViewCount";
      else if (query.sortBy === "date") sortField = "dateCreated";

      const totalVideos = await Video.countDocuments(searchQuery);

      const videos = await Video.aggregate([
        { $match: searchQuery },
        {
          $addFields: {
            length: {
              $size: { $ifNull: ["$likedBy", []] },
            },
          },
        },
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
          $lookup: {
            from: "videolikehistories",
            let: { videoId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$video", "$$videoId"] } } },
              { $count: "likesCount" },
            ],
            as: "likesInfo",
          },
        },
        {
          $lookup: {
            from: "videolikehistories",
            let: { videoId: "$_id", requester: new mongoose.Types.ObjectId(requesterId) },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$video", "$$videoId"] },
                      { $eq: ["$user", "$$requester"] },
                    ],
                  },
                },
              },
              { $project: { _id: 1 } },
            ],
            as: "userLike",
          },
        },
        {
          $lookup: {
            from: "comments",
            let: { videoId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$videoId", "$$videoId"] } } },
              { $count: "commentsCount" },
            ],
            as: "commentsInfo",
          },
        },
        {
          $addFields: {
            likesCount: { $ifNull: [{ $arrayElemAt: ["$likesInfo.likesCount", 0] }, 0] },
            isLiked: { $gt: [{ $size: "$userLike" }, 0] },
            commentsCount: { $ifNull: [{ $arrayElemAt: ["$commentsInfo.commentsCount", 0] }, 0] },
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            videoUrl: 1,
            thumbnailUrl: 1,
            enumMode: 1,
            dateCreated: 1,
            lastUpdated: 1,
            numOfViews: 1,
            likesCount: 1,
            commentsCount: 1,
            isLiked: 1,
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
        { $limit: Number(size) },
      ]);

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

  async getVideoLikeHistoryRepository(userId) {
    try {
      const videosList = await VideoLikeHistory.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $project: {
            video: 1,
          },
        },
        {
          $lookup: {
            from: "videos",
            localField: "video",
            foreignField: "_id",
            as: "videoDetails",
          },
        },
        { $unwind: "$videoDetails" },

        {
          $lookup: {
            from: "users",
            localField: "videoDetails.userId",
            foreignField: "_id",
            as: "videoDetails.user",
          },
        },
        { $unwind: { path: "$videoDetails.user", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "categories",
            localField: "videoDetails.categoryIds",
            foreignField: "_id",
            as: "videoDetails.categories",
          },
        },
        {
          $lookup: {
            from: "videolikehistories",
            let: { videoId: "$videoDetails._id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$video", "$$videoId"] } } },
              { $count: "likesCount" },
            ],
            as: "likesInfo",
          },
        },
        {
          $lookup: {
            from: "videolikehistories",
            let: { videoId: "$_id", requester: new mongoose.Types.ObjectId(requesterId) },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$video", "$$videoId"] },
                      { $eq: ["$user", "$$requester"] },
                    ],
                  },
                },
              },
              { $project: { _id: 1 } },
            ],
            as: "userLike",
          },
        },
        {
          $addFields: {
            "videoDetails.likesCount": {
              $ifNull: [{ $arrayElemAt: ["$likesInfo.likesCount", 0] }, 0],
            },
            isLiked: { $gt: [{ $size: "$userLike" }, 0] }, // True if user has liked the video
          },
        },
        {
          $project: {
            "videoDetails._id": 1,
            "videoDetails.title": 1,
            "videoDetails.description": 1,
            "videoDetails.videoUrl": 1,
            "videoDetails.thumbnailUrl": 1,
            "videoDetails.enumMode": 1,
            "videoDetails.dateCreated": 1,
            "videoDetails.lastUpdated": 1,
            "videoDetails.likesCount": 1, // Project likesCount here
            "videoDetails.user": {
              _id: 1,
              fullName: "$videoDetails.user.fullName",
              nickName: "$videoDetails.user.nickName",
              avatar: "$videoDetails.user.avatar",
            },
            "videoDetails.categories": {
              $map: {
                input: "$videoDetails.categories",
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
        { $sort: { "videoDetails.dateCreated": -1 } },
      ]);

      return videosList.map((item) => item.videoDetails);
    } catch (error) {
      throw new Error(`Error fetching video like history: ${error.message}`);
    }
  }

  async getVideoLikesCountRepository(userId) {
    try {
      const videos = await VideoLikeHistory.find({
        user: new mongoose.Types.ObjectId(userId),
      })
        .select("video -_id")
        .populate("video")
        .sort({ dateCreated: -1 });

      const videosList = videos.map((item) => item.video);
      return videosList;
    } catch (error) {
      throw new Error(
        `Error when fetching all video likes count: ${error.message}`
      );
    }
  }
}

module.exports = VideoRepository;
