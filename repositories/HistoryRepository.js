const WatchHistory = require("../entities/HistoryEntity");

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
            throw new Error(`Error creating/updating history record: ${error.message}`);
        }
    }

    // Get all history records
    async getAllHistoryRecordsRepository(userId, query) {
        try {
            const skip = (query.page - 1) * query.size;

            const searchQuery = { userId };

            const totalRecords = await WatchHistory.countDocuments(searchQuery);

            const historyRecords = await WatchHistory.find(searchQuery)
            .limit(query.size)
            .skip(skip);

            return { 
                historyRecords,
                total: totalRecords,
                page: query.page,
                totalPages: Math.ceil(totalRecords / query.size),
            };
        } catch (error) {
            throw new Error(`Error creating history record: ${error.message}`);
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
                throw new Error('History record not found');
            }
    
            return result;
        } catch (error) {
            throw new Error(`Error deleting history record: ${error.message}`);
        }
    }    
}

module.exports = HistoryRepository;
