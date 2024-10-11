const History = require("../entities/HistoryEntity");

class HistoryRepository {
    // Create a new history
    async createHistoryRecordRepository(data, session) {
        try {
            const { videoId, userId } = data;
    
            const history = await History.findOneAndUpdate(
                { videoId, userId },
                { $set: { lastUpdated: new Date() } },
                { new: true, upsert: true, session }
            );
    
            return history;
        } catch (error) {
            throw new Error(`Error creating/updating history record: ${error.message}`);
        }
    }
    

    async getAllHistoryRecordsRepository(userId) {
        try {
            const historyRecords = await History.find({ userId });

            return historyRecords;
        } catch (error) {
            throw new Error(`Error creating history record: ${error.message}`);
        }
    }
    
    // Clear all history of associated userId
    async clearAllHistoryRecordsRepository(userId) {
        try {
            const result = await History.deleteMany({ userId: userId, isDeleted: false });
    
            if (result.deletedCount === 0) {
                throw new Error('No history records found for the given user and type');
            }
    
            return true;
        } catch (error) {
            throw new Error(`Error clearing history: ${error.message}`);
        }
    }
    
    async deleteHistoryRecordById(historyId) {
        try {
            const result = await History.findByIdAndUpdate(
                historyId,
                { $set: { isDeleted: true } },
                { new: true, runValidators: true }
            );

            if (!result) {
                throw new Error('History record not found');
            }

            return result;
        } catch (error) {
            throw new Error(`Error soft deleting history record: ${error.message}`);
        }
    }
}

module.exports = HistoryRepository;
