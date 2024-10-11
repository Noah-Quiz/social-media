const DatabaseTransaction = require("../repositories/DatabaseTransaction");

const createHistoryRecordService = async (data) => {
    try {
        const connection = new DatabaseTransaction();

        const historyRecord = await connection.historyRepository.createHistoryRecordRepository(data);

        return historyRecord;
    } catch (error) {
        throw error;
    }
}

const clearAllHistoryRecordsService = async (userId) => {
    try {
        const connection = new DatabaseTransaction();

        await connection.historyRepository.clearAllHistoryRecordsRepository(userId);

        return;
    } catch (error) {
        throw error;
    }
}

const getAllHistoryRecordsService = async (userId) => {
    try {
        const connection = new DatabaseTransaction();

        const historyRecords = await connection.historyRepository.getAllHistoryRecordsRepository(userId);

        return historyRecords;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createHistoryRecordService,
    clearAllHistoryRecordsService,
    getAllHistoryRecordsService
}