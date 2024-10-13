const mongoose = require("mongoose");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const { createHistoryRecordService, getAllHistoryRecordsService, clearAllHistoryRecordsService, deleteHistoryRecordService } = require("../services/HistoryService");
const CoreException = require("../exceptions/CoreException");

class HistoryController {
    async createHistoryRecordController(req, res) {
        const { videoId } = req.body;
        const userId = req.userId;

        const data = { videoId, userId }

        try {
            const historyRecord = await createHistoryRecordService(data);

            return res.status(StatusCodeEnums.Created_201).json({ historyRecord, message: "Success" });
        } catch (error) {
            if (error instanceof CoreException) {
                return res.status(error.code).json({ message: error.message });
            } else {
                return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
            }
        }
    }

    async clearAllHistoryRecordsController(req, res) {
        const userId = req.userId;

        try {
            await clearAllHistoryRecordsService(userId);

            return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
        } catch (error) {
            if (error instanceof CoreException) {
                return res.status(error.code).json({ message: error.message });
            } else {
                return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
            }
        }
    }

    async deleteHistoryRecordController(req, res) {
        const { historyId } = req.params;

        try {
            await deleteHistoryRecordService(historyId);

            return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
        } catch (error) {
            if (error instanceof CoreException) {
                return res.status(error.code).json({ message: error.message });
            } else {
                return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
            }
        }
    }

    async getAllHistoryRecordsController(req, res) {
        const userId = req.userId;
        const query = req.query;

        if (!query.page) query.page = 1;
        if (!query.size) query.size = 10;
        if (query.page < 1) {
            return res.status(StatusCodeEnums.BadRequest_400).json({ message: "Page cannot be less than 1" })
        }
        if (query.size < 1) {
            return res.status(StatusCodeEnums.BadRequest_400).json({ message: "Size cannot be less than 1" })
        }

        try {
            const { historyRecords, total, page, totalPages } = await getAllHistoryRecordsService(userId, query);

            return res.status(StatusCodeEnums.OK_200).json({ historyRecords, total, page, totalPages, message: "Success" });
        } catch (error) {
            if (error instanceof CoreException) {
                return res.status(error.code).json({ message: error.message });
            } else {
                return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
            }
        }
    }
}

module.exports = HistoryController;
