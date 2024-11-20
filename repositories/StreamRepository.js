const { default: mongoose } = require("mongoose");
const Stream = require("../entities/StreamEntity");

class StreamRepository {
  // Create a new stream
  async createStreamRepository(data, session) {
    try {
      const stream = await Stream.create(
        [{ ...data, lastUpdated: Date.now() }],
        { session }
      );
      return stream[0];
    } catch (error) {
      throw new Error(`Error creating stream: ${error.message}`);
    }
  }

  async getStreamByCloudflareId(uid) {
    try {
      const stream = await Stream.findOne({ uid });

      return stream;
    } catch (error) {
      throw new Error(`Error getting stream: ${error.message}`);
    }
  }

  // Get a stream by ID
  async getStreamRepository(streamId) {
    try {
      const result = await Stream.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(streamId),
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
          $addFields: {
            likesCount: { $size: "$likedBy" },
            currentViewCount: { $ifNull: ["$currentViewCount", 0] },
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            title: 1,
            description: 1,
            thumbnailUrl: 1,
            streamServerUrl: 1,
            streamOnlineUrl: 1,
            currentViewCount: 1,
            peakViewCount: 1,
            likesCount: 1,
            likedBy: 1,
            uid: 1,
            rtmps: 1,
            rtmpsPlayback: 1,
            srt: 1,
            srtPlayback: 1,
            webRtc: 1,
            webRtcPlayback: 1,
            status: 1,
            enumMode: 1,
            dateCreated: 1,
            lastUpdated: 1,
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
      ]);

      return result[0] || null;
    } catch (error) {
      throw new Error(`Error finding stream: ${error.message}`);
    }
  }

  // Update a stream
  async updateStreamRepository(streamId, updateData, session = null) {
    try {
      updateData.lastUpdated = Date.now();

      const updatedStream = await Stream.findByIdAndUpdate(
        streamId,
        updateData,
        { new: true, session }
      );

      return updatedStream;
    } catch (error) {
      throw new Error(`Error updating stream: ${error.message}`);
    }
  }


  // Delete a stream by ID
  async deleteStreamRepository(streamId, session) {
    try {
      const stream = await Stream.findByIdAndUpdate(
        streamId,
        { isDeleted: true, lastUpdated: Date.now() },
        { new: true, runValidators: true, session }
      );

      if (!stream) {
        throw new Error("Stream not found");
      }

      return stream;
    } catch (error) {
      throw new Error(`Error deleting stream: ${error.message}`);
    }
  }

  async getStreamsByUserIdRepository(query, userId) {
    try {
      const page = query.page || 1;
      const size = query.size || 10;
      const skip = (page - 1) * size;

      const searchQuery = { 
        isDeleted: false,
        userId: new mongoose.Types.ObjectId(userId), 
      };

      // Prepare query
      if (query.title) {
        searchQuery.title = { $regex: new RegExp(query.title, "i") };
      }      
      if (query.uid) searchQuery.uid = query.uid;
      if (query.status) searchQuery.status = query.status;

      let sortField = "dateCreated"; // Default sort field
      let sortOrder = -1; // Default to descending order

      if (query.sortBy === "like") sortField = "likesCount";
      else if (query.sortBy === "view") sortField = "currentViewCount";
      else if (query.sortBy === "date") sortField = "dateCreated";

      sortOrder = query.order === "ascending" ? 1 : -1;
      
      const totalStreams = await Stream.countDocuments(searchQuery);

      // Get streams with sorting on computed fields
      const streams = await Stream.aggregate([
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
          $addFields: {
            likesCount: { $size: "$likedBy" },
            currentViewCount: { $ifNull: ["$currentViewCount", 0] },
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            title: 1,
            description: 1,
            thumbnailUrl: 1,
            streamServerUrl: 1,
            streamOnlineUrl: 1,
            currentViewCount: 1,
            peakViewCount: 1,
            likesCount: 1,
            likedBy: 1,
            status: 1,
            enumMode: 1,
            dateCreated: 1,
            lastUpdated: 1,
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
        streams,
        total: totalStreams,
        page: Number(page),
        totalPages: Math.ceil(totalStreams / Number(size)),
      };
    } catch (error) {
      throw new Error(`Error getting streams: ${error.message}`);
    }
  }

  // Get all streams
  async getStreamsRepository(query) {
    try {
      const page = query.page || 1;
      const size = query.size || 10;
      const skip = (page - 1) * size;

      const searchQuery = { isDeleted: false };

      // Prepare query
      if (query.title) {
        searchQuery.title = { $regex: new RegExp(query.title, "i") };
      }      
      if (query.uid) searchQuery.uid = query.uid;
      if (query.status) searchQuery.status = query.status;

      let sortField = "dateCreated"; // Default sort field
      let sortOrder = -1; // Default to descending order

      if (query.sortBy === "like") sortField = "likesCount";
      else if (query.sortBy === "view") sortField = "currentViewCount";
      else if (query.sortBy === "date") sortField = "dateCreated";

      sortOrder = query.order === "ascending" ? 1 : -1;
      
      const totalStreams = await Stream.countDocuments(searchQuery);

      // Get streams with sorting on computed fields
      const streams = await Stream.aggregate([
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
          $addFields: {
            likesCount: { $size: "$likedBy" },
            currentViewCount: { $ifNull: ["$currentViewCount", 0] },
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            title: 1,
            description: 1,
            thumbnailUrl: 1,
            streamServerUrl: 1,
            streamOnlineUrl: 1,
            currentViewCount: 1,
            peakViewCount: 1,
            likesCount: 1,
            likedBy: 1,
            status: 1,
            enumMode: 1,
            dateCreated: 1,
            lastUpdated: 1,
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
        streams,
        total: totalStreams,
        page: Number(page),
        totalPages: Math.ceil(totalStreams / Number(size)),
      };
    } catch (error) {
      throw new Error(`Error getting streams: ${error.message}`);
    }
  }

  async toggleLikeStreamRepository(streamId, userId) {
    let hasLiked = false;
    try {
      const stream = await Stream.findById(streamId);
  
      hasLiked = stream.likedBy.includes(userId);
  
      const updateAction = hasLiked
        ? { $pull: { likedBy: userId } }
        : { $addToSet: { likedBy: userId } };
  
      await Stream.findByIdAndUpdate(streamId, updateAction, { new: true });
  
      return hasLiked ? "unlike" : "like";
    } catch (error) {
      const action = hasLiked ? "unlike" : "like";
      throw new Error(`Failed to ${action} the stream: ${error.message}`);
    }
  }  

  async countTotalStreamsRepository() {
    return await Stream.countDocuments({ isDeleted: false });
  }

  async countTodayStreamsRepository() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    return await Stream.countDocuments({
      isDeleted: false,
      dateCreated: {
        $gte: new Date(currentYear, currentMonth - 1, now.getDate()),
        $lt: new Date(currentYear, currentMonth - 1, now.getDate() + 1),
      },
    });
  }

  async countThisWeekStreamsRepository() {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const streamsThisWeek = await Stream.countDocuments({
      isDeleted: false,
      dateCreated: { $gte: weekStart },
    });
    return streamsThisWeek;
  }

  async countThisMonthStreamsRepository() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const streamsThisMonth = await Stream.countDocuments({
      isDeleted: false,
      dateCreated: {
        $gte: new Date(currentYear, currentMonth - 1, 1),
        $lt: new Date(currentYear, currentMonth, 1),
      },
    });
    return streamsThisMonth;
  }

  async countMonthlyStreamsRepository() {
    const streamsMonthly = await Stream.aggregate([
      {
        $match: { isDeleted: false },
      },
      {
        $group: {
          _id: {
            year: { $year: "$dateCreated" },
            month: { $month: "$dateCreated" },
          },
          streamCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    return streamsMonthly;
  }

  async getRecommendedStreamsRepository(query) {
    try {
      const page = query.page || 1;
      const size = query.size || 10;
      const skip = (page - 1) * size;

      const { requesterId } = query;

      const recentLikedStreams = await Stream.aggregate([
        {
          $match: { likedBy: new mongoose.Types.ObjectId(requesterId) },
        },
        { $sort: { dateCreated: -1 } },
        { $limit: 50 },
        { $unwind: "$categoryIds" },
        {
          $group: {
            _id: null,
            categoryIds: { $addToSet: "$categoryIds" },
          },
        },
        {
          $project: { _id: 0, categoryIds: 1 },
        },
      ]);

      const categoryIds = recentLikedStreams[0]?.categoryIds || [];

      const searchQuery = {
        status: "live",
        ...(categoryIds.length > 0 && { categoryIds: { $in: categoryIds } }),
      };

      const totalRecommendedStreams = await Stream.countDocuments(searchQuery);

      const recommendedStreams = await Stream.aggregate([
        {
          $match: searchQuery
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
          $addFields: {
            isLiked: {
              $in: [new mongoose.Types.ObjectId(requesterId), "$likedBy"],
            },
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            thumbnailUrl: 1,
            streamServerUrl: 1,
            streamOnlineUrl: 1,
            currentViewCount: 1,
            peakViewCount: 1,
            status: 1,
            enumMode: 1,
            dateCreated: 1,
            lastUpdated: 1,
            likesCount: { $size: "$likedBy" },
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
        { $sort: { likesCount: -1, currentViewCount: -1 } },
        { $skip: skip },
        { $limit: Number(size) },
      ]);

      return {
        streams: recommendedStreams,
        total: totalRecommendedStreams,
        page: Number(page),
        totalPages: Math.ceil(totalRecommendedStreams / Number(size)),
      };
    } catch (error) {
      throw error;
    }
  }

  async getRelevantStreamsRepository(query) {
    try {
      const page = query.page || 1;
      const size = query.size || 10;
      const skip = (page - 1) * size;

      const { requesterId } = query;

      const { categoryIds } = query;
      const categoryIdsObjectIds = categoryIds.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
  
      let searchQuery = { status: "live" };
  
      // If categoryIds is not empty, filter by categoryIds
      if (categoryIdsObjectIds && categoryIdsObjectIds.length > 0) {
        searchQuery.categoryIds = { $in: categoryIdsObjectIds };
      }

      const totalRelevantStreams = await Stream.countDocuments(searchQuery)
  
      const relevantStreams = await Stream.aggregate([
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
          $addFields: {
            isLiked: {
              $in: [new mongoose.Types.ObjectId(requesterId), "$likedBy"],
            },
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            thumbnailUrl: 1,
            streamServerUrl: 1,
            streamOnlineUrl: 1,
            currentViewCount: 1,
            peakViewCount: 1,
            status: 1,
            enumMode: 1,
            dateCreated: 1,
            lastUpdated: 1,
            likesCount: { $size: "$likedBy" },
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
        streams: relevantStreams,
        total: totalRelevantStreams,
        page: Number(page),
        totalPages: Math.ceil(totalRelevantStreams / Number(size)),
      };
    } catch (error) {
      throw error;
    }
  }

  async calculateAvgViewsRepository() {
    try {
      const result = await Stream.aggregate([
        {
          $match: { isDeleted: false, peakViewCount: { $gt: 0 } }, // Include all records that are not deleted & have peak view count > 0
        },
        {
          $group: {
            _id: null,
            totalPeakViewCount: { $sum: "$peakViewCount" }, // Sum of all peak view counts
            count: { $sum: 1 }, // Count of all documents
          },
        },
        {
          $project: {
            _id: 0,
            averagePeakViewCount: {
              $divide: ["$totalPeakViewCount", "$count"],
            }, // Divide total by count
          },
        },
      ]);
      return result.length > 0 ? Math.floor(result[0].averagePeakViewCount) : 0;
    } catch (error) {
      throw new Error(`Error calculating average views: ${error.message}`);
    }
  }
  async calculateHighestViewsRepository() {
    try {
      const result = await Stream.aggregate([
        {
          $match: { isDeleted: false, peakViewCount: { $gt: 0 } }, // Include all records that are not deleted & have peak view count > 0
        },
        {
          $sort: { peakViewCount: -1 },
        },
        {
          $limit: 1,
        },
      ]);
      return result.length > 0 ? result[0].peakViewCount : 0;
    } catch (error) {
      throw new Error(`Error calculating highest view: ${error.message}`);
    }
  }

  async calculateLowestViewsRepository() {
    try {
      const result = await Stream.aggregate([
        {
          $match: { isDeleted: false, peakViewCount: { $gt: 0 } }, // Include all records that are not deleted & have peak view count > 0
        },
        {
          $sort: { peakViewCount: 1 },
        },
        {
          $limit: 1,
        },
      ]);
      return result.length > 0 ? result[0].peakViewCount : 0;
    } catch (error) {
      throw new Error(`Error calculating lowest view: ${error.message}`);
    }
  }
}

module.exports = StreamRepository;
