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
      const page = parseInt(query.page) || 1;
      const size = parseInt(query.size, 10) || 10;
      const skip = (page - 1) * size;
  
      const searchQuery = { userId: new mongoose.Types.ObjectId(userId) };
      const sortField = query.sortField || "lastUpdated"; // Default sort field
      const sortOrder = query.order === "ascending" ? 1 : -1;
  
      // Construct the pipeline dynamically
      const pipeline = [
        {
          $match: searchQuery,
        },
        {
          $lookup: {
            from: "videos",
            localField: "videoId",
            foreignField: "_id",
            as: "video",
          },
        },
        {
          $unwind: "$video",
        },
      ];
  
      // Add a title match stage if query.title exists
      if (query.title) {
        pipeline.push({
          $match: {
            "video.title": { $regex: query.title, $options: "i" },
          },
        });
      }
  
      pipeline.push(
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
          $addFields: {
            likesCount: {
              $ifNull: [{ $arrayElemAt: ["$likesInfo.likesCount", 0] }, 0],
            },
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            dateCreated: 1,
            lastUpdated: 1,
            video: {
              _id: 1,
              title: 1,
              description: 1,
              thumbnailUrl: 1,
              numOfViews: 1,
              likesCount: 1,
            },
          },
        },
        {
          $sort: { [sortField]: sortOrder },
        },
        {
          $skip: skip,
        },
        {
          $limit: Number(size),
        }
      );
  
      // Fetch total records count
      const totalRecords = await WatchHistory.aggregate([
        { $match: searchQuery },
      ]);
  
      // Fetch paginated history records
      const historyRecords = await WatchHistory.aggregate(pipeline);
  
      return {
        historyRecords,
        total: totalRecords.length,
        page: Number(page),
        totalPages: Math.ceil(totalRecords.length / Number(size)),
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
