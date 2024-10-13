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

const deleteHistoryRecordService = async (historyId) => {
    try {
        const connection = new DatabaseTransaction();

        await connection.historyRepository.deleteHistoryRecordRepository(historyId);

        return;
    } catch (error) {
        throw error;
    }
}

const getAllHistoryRecordsService = async (userId, query) => {
    try {
        const connection = new DatabaseTransaction();

        const data = await connection.historyRepository.getAllHistoryRecordsRepository(userId, query);

        return data;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createHistoryRecordService,
    clearAllHistoryRecordsService,
    getAllHistoryRecordsService,
    deleteHistoryRecordService,
}