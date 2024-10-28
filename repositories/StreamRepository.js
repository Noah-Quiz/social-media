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
            status: "live",
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
            pipeline: [
              {
                $project: {
                  name: 1,
                  imageUrl: 1,
                  _id: 0,
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
        { $project: { categoryIds: 0 } },
      ]);

      return result[0] || null;
    } catch (error) {
      throw new Error(`Error finding stream: ${error.message}`);
    }
  }

  // Update a stream
  async updateStreamRepository(
    streamId,
    updateData,
    categoryData,
    session = null
  ) {
    try {
      const updateOperations = { lastUpdated: Date.now(), ...updateData };

      if (
        categoryData &&
        categoryData.addedCategoryIds &&
        categoryData.addedCategoryIds.length > 0
      ) {
        await Stream.updateOne(
          { _id: streamId },
          {
            $addToSet: {
              categoryIds: { $each: categoryData.addedCategoryIds },
            },
            lastUpdated: Date.now(),
          },
          { runValidators: true, session }
        );
      }

      if (
        categoryData &&
        categoryData.removedCategoryIds &&
        categoryData.removedCategoryIds.length > 0
      ) {
        await Stream.updateOne(
          { _id: streamId },
          {
            $pull: { categoryIds: { $in: categoryData.removedCategoryIds } },
            lastUpdated: Date.now(),
          },
          { runValidators: true, session }
        );
      }

      const updatedStream = await Stream.findByIdAndUpdate(
        streamId,
        updateOperations,
        { new: true, runValidators: true, session }
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

  // Get all streams
  async getStreamsRepository(query, requester) {
    try {
      const page = query.page || 1;
      const size = query.size || 10;
      const skip = (page - 1) * size || 0;

      const searchQuery = { isDeleted: false };

      if (query.title) {
        searchQuery.name = query.title;
      }
      if (query.uid) {
        searchQuery.uid = query.uid;
      }

      const totalStreams = await Stream.countDocuments({
        ...searchQuery,
        status: "live",
        $or: [
          { enumMode: { $ne: "private" } }, // Include public and member streams
          { userId: new mongoose.Types.ObjectId(requester) }, // Include private streams if the requester is the owner
        ],
      });

      const streams = await Stream.aggregate([
        { $match: { ...searchQuery, status: "live" } },
        { $skip: skip },
        { $limit: size },
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
      ]);

      return {
        streams,
        total: totalStreams,
        page: page,
        totalPages: Math.ceil(totalStreams / size),
      };
    } catch (error) {
      throw new Error(`Error getting streams: ${error.message}`);
    }
  }

  async toggleLikeStreamRepository(streamId, userId, action = "like") {
    try {
      const updateAction =
        action === "like"
          ? { $addToSet: { likedBy: userId } }
          : { $pull: { likedBy: userId } };

      const updatedVideo = await Stream.findByIdAndUpdate(
        streamId,
        updateAction,
        { new: true }
      );

      if (!updatedVideo) {
        throw new Error("Stream not found");
      }

      return true;
    } catch (error) {
      throw new Error(`Error in toggling like/unlike: ${error.message}`);
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
  async getRecommendedStreamsRepository(data) {
    try {
      const { userId } = data;

      // Step 1: Find the categories of the most recent liked streams
      const recentLikedStreams = await Stream.aggregate([
        {
          $match: {
            likedBy: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $limit: 100,
        },
        {
          $unwind: "$categoryIds",
        },
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
      console.log(recentLikedStreams);

      // Check if there are any categories to recommend from
      if (
        !recentLikedStreams.length ||
        !recentLikedStreams[0].categoryIds.length
      ) {
        return [];
      }

      const categoryIds = recentLikedStreams[0].categoryIds;

      // Step 2: Find live streams with matching category IDs and populate necessary fields
      const recommendedStreams = await Stream.aggregate([
        {
          $match: {
            status: "live",
            categoryIds: { $in: categoryIds },
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
        { $unwind: "$user" }, // Unwind user array to single document
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
            _id: 1, // Include stream ID
            userId: 1, // Include user ID
            status: 1, // Include stream status
            createdAt: 1, // Include stream creation time
            user: {
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
                },
              },
            },
            likesCount: { $size: "$likedBy" }, // Calculate number of likes
          },
        },
        {
          $sort: { createdAt: -1 }, // Sort by created time
        },
        { $limit: 50 }, // Limit the number of recommended streams
      ]);

      return recommendedStreams;
    } catch (error) {
      console.error("Error fetching recommended streams:", error);
      throw error;
    }
  }

  async getRelevantStreamsRepository(data) {
    try {
      const { categoryIds, streamerId } = data;
      const categoryIdsObjectIds = categoryIds.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
      console.log(data);

      const query = {
        status: "live",
        categoryIds: { $in: categoryIdsObjectIds },
        userId: new mongoose.Types.ObjectId(streamerId),
      };

      const relevantStreams = await Stream.aggregate([
        {
          $match: query,
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
          $project: {
            _id: 1,
            likesCount: { $size: "$likedBy" },
            streamServerUrl: 1,
            streamOnlineUrl: 1,
            createdAt: 1,
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
            likesCount: -1,
            createdAt: -1,
          },
        },
      ]);

      return relevantStreams;
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
