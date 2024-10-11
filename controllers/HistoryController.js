const mongoose = require("mongoose");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const { createHistoryRecordService, getAllHistoryRecordsService, clearAllHistoryRecordsService } = require("../services/HistoryService");
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

    async getAllHistoryRecordsController(req, res) {
        const userId = req.userId;
    
        try {
            const historyRecords = await getAllHistoryRecordsService(userId);
    
            return res.status(StatusCodeEnums.OK_200).json({ historyRecords, message: "Success" });
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
