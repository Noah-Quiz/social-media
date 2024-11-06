const StatusCodeEnums = require("../enums/StatusCodeEnum");
const {
  createHistoryRecordService,
  getAllHistoryRecordsService,
  clearAllHistoryRecordsService,
  deleteHistoryRecordService,
} = require("../services/HistoryService");
const CoreException = require("../exceptions/CoreException");
const CreateHistoryRecordDto = require("../dtos/History/CreateHistoryRecordDto");
const GetHistoryRecordsDto = require("../dtos/History/GetHistoryRecordsDto");
const DeleteHistoryRecordsDto = require("../dtos/History/DeleteHistoryRecordsDto");
const DeleteHistoryRecordDto = require("../dtos/History/DeleteHistoryRecordDto");

class HistoryController {
  async createHistoryRecordController(req, res, next) {
    try {
      const { videoId } = req.body;
      const userId = req.userId;

      const createHistoryRecordDto = new CreateHistoryRecordDto(
        videoId
      );
      await createHistoryRecordDto.validate();

      const data = { videoId, userId };

      const historyRecord = await createHistoryRecordService(data);

      return res
        .status(StatusCodeEnums.Created_201)
        .json({ historyRecord, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async clearAllHistoryRecordsController(req, res, next) {
    try {
      const userId = req.userId;
      const deleteHistoryRecordsDto = new DeleteHistoryRecordsDto(userId);
      await deleteHistoryRecordsDto.validate();

      await clearAllHistoryRecordsService(userId);

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async deleteHistoryRecordController(req, res, next) {
    try {
      const { historyId } = req.params;
      const deleteHistoryRecordDto = new DeleteHistoryRecordDto(historyId);
      await deleteHistoryRecordDto.validate();

      await deleteHistoryRecordService(historyId);

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async getAllHistoryRecordsController(req, res, next) {
    try {
      const userId = req.userId;
      const query = req.query;
      const getHistoryRecordsDto = new GetHistoryRecordsDto(
        userId,
        query.page,
        query.size
      );
      await getHistoryRecordsDto.validate();

      if (!query.page) query.page = 1;
      if (!query.size) query.size = 10;
      
    if (query.title) {
      query.title = { $regex: query.title, $options: "i" };
    }
    
      const { historyRecords, total, page, totalPages } =
        await getAllHistoryRecordsService(userId, query);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ historyRecords, total, page, totalPages, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HistoryController;
