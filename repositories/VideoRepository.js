const Video = require("../entities/VideoEntity");
const MyPlaylist = require("../entities/MyPlaylistEntity");
const mongoose = require("mongoose");
const User = require("../entities/UserEntity");
const VideoLikeHistory = require("../entities/VideoLikeHistoryEntity");
const WatchHistory = require("../entities/HistoryEntity");

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
        userId: userObjectId,
        videoId: videoObjectId,
      });
  
      if (!videoLike) {
        action = "like";
        await VideoLikeHistory.create({
          userId: userObjectId,
          videoId: videoObjectId,
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

  async getVideoLikeHistoryRepository(userId, query) {
    try {
      const page = query.page || 1;
      const size = query.size || 10;
      const skip = (page - 1) * size;

      const searchQuery = {
        userId: new mongoose.Types.ObjectId(userId),
      }
  
      const videos = await VideoLikeHistory.aggregate([
        {
          $match: searchQuery
        },
        {
          $lookup: {
            from: "videos",
            localField: "videoId",
            foreignField: "_id",
            as: "video",
          },
        },
        { $unwind: "$video" },
        ...(query.title
          ? [
              {
                $match: {
                  "video.title": { $regex: new RegExp(query.title, "i") },
                },
              },
            ]
          : []),
        {
          $lookup: {
            from: "users",
            localField: "video.userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "categories",
            localField: "video.categoryIds",
            foreignField: "_id",
            as: "categories",
          },
        },
        {
          $lookup: {
            from: "videolikehistories",
            let: { videoId: "$video._id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$videoId", "$$videoId"] } } },
              { $count: "likesCount" },
            ],
            as: "likesInfo",
          },
        },
        {
          $lookup: {
            from: "comments",
            let: { videoId: "$video._id" },
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
            commentsCount: { $ifNull: [{ $arrayElemAt: ["$commentsInfo.commentsCount", 0] }, 0] },
            isLiked: true,
          },
        },
        {
          $project: {
            _id: 1,
            videoId: "$video._id",
            title: "$video.title",
            description: "$video.description",
            enumMode: "$video.enumMode",
            thumbnailUrl: "$video.thumbnailUrl",
            videoUrl: "$video.videoUrl",
            dateCreated: "$video.dateCreated",
            likesCount: 1,
            isLiked: 1,
            commentsCount: 1,
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
        { $sort: { dateCreated: -1 } },
        { $skip: skip },
        { $limit: size },
      ]);
  
      const totalVideos = await VideoLikeHistory.countDocuments(searchQuery);
  
      return {
        videos,
        total: totalVideos,
        page,
        totalPages: Math.ceil(totalVideos / size),
      };
    } catch (error) {
      throw new Error(`Error fetching video like history: ${error.message}`);
    }
  }

  async getRelevantVideosRepository(query) {
    try {
      const page = query.page || 1;
      const size = query.size || 10;
      const skip = (page - 1) * size;

      const { requesterId } = query;

      const { categoryIds } = query;
      const categoryIdsObjectIds = categoryIds.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
  
      let searchQuery = { enumMode: { $in: ["public", "member"] } };
  
      // If categoryIds is not empty, filter by categoryIds
      if (categoryIdsObjectIds && categoryIdsObjectIds.length > 0) {
        searchQuery.categoryIds = { $in: categoryIdsObjectIds };
      }

      const totalRelevantVideos = await Video.countDocuments(searchQuery)
  
      const relevantVideos = await Video.aggregate([
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
        {
          $sort: {
            likesCount: -1,  // Sort by likes count
            currentViewCount: -1,  // Sort by view count
            dateCreated: -1,  // Sort by creation date
          },
        },
        { $skip: skip },
        { $limit: Number(size) },
      ]);

      return {
        videos: relevantVideos,
        total: totalRelevantVideos,
        page: Number(page),
        totalPages: Math.ceil(totalRelevantVideos / Number(size)),
      };
    } catch (error) {
      throw error;
    }
  }

  async getRecommendedVideosRepository(query) {
    try {
      const page = query.page || 1;
      const size = query.size || 10;
      const skip = (page - 1) * size;
  
      const { requesterId } = query;
  
      // Fetch categories from the recent 50 liked videos
      const likedVideoIds = await VideoLikeHistory.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(requesterId) } },
        { $sort: { dateCreated: -1 } },
        { $limit: 50 },
        { $group: { _id: null, videoIds: { $addToSet: "$videoId" } } },
      ]).then((result) => result[0]?.videoIds || []);
  
      // Fetch categories from the recent 50 watched videos
      const watchedVideoIds = await WatchHistory.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(requesterId) } },
        { $sort: { dateCreated: -1 } },
        { $limit: 50 },
        { $group: { _id: null, videoIds: { $addToSet: "$videoId" } } },
      ]).then((result) => result[0]?.videoIds || []);
  
      // Combine video IDs from liked and watched videos
      const combinedVideoIds = [...new Set([...likedVideoIds, ...watchedVideoIds])];
  
      // Fetch unique categories from the combined video IDs
      const categoryIdsObjectIds = await Video.aggregate([
        { $match: { _id: { $in: combinedVideoIds } } },
        {
          $project: {
            categoryIds: 1,
          },
        },
        { $unwind: "$categoryIds" },
        {
          $group: {
            _id: null,
            uniqueCategoryIds: { $addToSet: "$categoryIds" },
          },
        },
      ]).then((result) => result[0]?.uniqueCategoryIds || []);

      let searchQuery = { enumMode: { $in: ["public", "member"] } };
  
      // If categoryIds is not empty, filter by categoryIds
      if (categoryIdsObjectIds && categoryIdsObjectIds.length > 0) {
        searchQuery.categoryIds = { $in: categoryIdsObjectIds };
      }
  
      const totalRecommendedVideos = await Video.countDocuments(searchQuery);
  
      const recommendedVideos = await Video.aggregate([
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
        {
          $sort: {
            likesCount: -1, // Sort by likes count
            currentViewCount: -1, // Sort by view count
            dateCreated: -1, // Sort by creation date
          },
        },
        { $skip: skip },
        { $limit: Number(size) },
      ]);
  
      return {
        videos: recommendedVideos,
        total: totalRecommendedVideos,
        page: Number(page),
        totalPages: Math.ceil(totalRecommendedVideos / Number(size)),
      };
    } catch (error) {
      throw error;
    }
  }  
}

module.exports = VideoRepository;
