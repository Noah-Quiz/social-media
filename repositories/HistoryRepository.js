const WatchHistory = require("../entities/HistoryEntity");
const mongoose = require("mongoose");
class HistoryRepository {
  // Create a new history
  async createHistoryRecordRepository(data, session) {
    try {
      const { videoId, userId } = data;

      const history = await WatchHistory.findOneAndUpdate(
        { videoId, userId },
        { $set: { lastUpdated: new Date() } },
        { new: true, upsert: true, session }
      );

      return history;
    } catch (error) {
      throw new Error(
        `Error creating/updating history record: ${error.message}`
      );
    }
  }

  // Get all history records
  async getAllHistoryRecordsRepository(userId, query) {
    try {
      const skip = (query.page - 1) * query.size;

      const searchQuery = { userId: new mongoose.Types.ObjectId(userId) };
      let sortField = "lastUpdated"; // Default sort field
      let sortOrder = query.order === "ascending" ? 1 : -1;
      const totalRecords = await WatchHistory.aggregate([
        {
          $match: searchQuery,
        },
        {
          $lookup: {
            from: "videos",
            localField: "videoId",
            foreignField: "_id",
            as: "videoDetails",
          },
        },
        {
          $unwind: "$videoDetails",
        },
        ...(query.title
          ? [
              {
                $match: {
                  "videoDetails.title": query.title,
                },
              },
            ]
          : []),
      ]);
      const historyRecords = await WatchHistory.aggregate([
        {
          $match: searchQuery,
        },
        {
          $lookup: {
            from: "videos",
            localField: "videoId",
            foreignField: "_id",
            as: "videoDetails",
          },
        },
        {
          $unwind: "$videoDetails",
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            videoId: 1,
            lastUpdated: 1,
            "videoDetails.title": 1, // Project only necessary fields
          },
        },
        ...(query.title
          ? [
              {
                $match: {
                  "videoDetails.title": query.title,
                },
              },
            ]
          : []),
        {
          $sort: {[sortField]: sortOrder},
        },
        {
          $skip: skip,
        },
        {
          $limit: Number(query.size),
        },
      ]);

      return {
        historyRecords,
        total: totalRecords.length,
        page: Number(query.page),
        totalPages: Math.ceil(totalRecords.length / query.size),
      };
    } catch (error) {
      throw new Error(`Error getting history records: ${error.message}`);
    }
  }

  // Clear all history of associated userId
  async clearAllHistoryRecordsRepository(userId) {
    try {
      await WatchHistory.deleteMany({ userId: userId });

      return true;
    } catch (error) {
      throw new Error(`Error clearing history: ${error.message}`);
    }
  }

  async deleteHistoryRecordRepository(historyId) {
    try {
      const result = await WatchHistory.findByIdAndDelete(historyId);

      if (!result) {
        throw new Error("History record not found");
      }

      return result;
    } catch (error) {
      throw new Error(`Error deleting history record: ${error.message}`);
    }
  }
}

module.exports = HistoryRepository;
