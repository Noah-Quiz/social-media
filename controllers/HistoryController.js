const StatusCodeEnums = require("../enums/StatusCodeEnum");
const {
  createHistoryRecordService,
  getAllHistoryRecordsService,
  clearAllHistoryRecordsService,
  deleteHistoryRecordService,
  getViewStatisticService,
} = require("../services/HistoryService");
const CoreException = require("../exceptions/CoreException");
const CreateHistoryRecordDto = require("../dtos/History/CreateHistoryRecordDto");
const GetHistoryRecordsDto = require("../dtos/History/GetHistoryRecordsDto");
const DeleteHistoryRecordsDto = require("../dtos/History/DeleteHistoryRecordsDto");
const DeleteHistoryRecordDto = require("../dtos/History/DeleteHistoryRecordDto");
const { json } = require("express/lib/response");
const GetViewStatisticDto = require("../dtos/Statistic/GetViewStatisticDto");
class HistoryController {
  async createHistoryRecordController(req, res, next) {
    try {
      const { videoId } = req.body;
      const userId = req.userId;

      const createHistoryRecordDto = new CreateHistoryRecordDto(videoId);
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

      const result = await clearAllHistoryRecordsService(userId);
      if (result !== true) {
        return res
          .status(StatusCodeEnums.NotFound_404)
          .json({ message: "No history record exist" });
      }
      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async deleteHistoryRecordController(req, res, next) {
    try {
      const userId = req.userId;
      const { historyId } = req.params;
      const deleteHistoryRecordDto = new DeleteHistoryRecordDto(historyId);
      await deleteHistoryRecordDto.validate();

      await deleteHistoryRecordService(historyId, userId);

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async getAllHistoryRecordsController(req, res, next) {
    try {
      const userId = req.userId;
      const query = {
        page: req.query.page,
        size: req.query.size,
        title: req.query.title,
      };

      const getHistoryRecordsDto = new GetHistoryRecordsDto(
        userId,
        query.page,
        query.size
      );
      await getHistoryRecordsDto.validate();

      const { historyRecords, total, page, totalPages } =
        await getAllHistoryRecordsService(userId, query);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ historyRecords, total, page, totalPages, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
  async getViewStatisticController(req, res, next) {
    try {
      const { ownerId } = req.params;
      const { TimeUnit, value } = req.query;
      const getViewStatisticDto = new GetViewStatisticDto(
        ownerId,
        TimeUnit,
        value
      );

      await getViewStatisticDto.validate();
      const result = await getViewStatisticService(ownerId, TimeUnit, value);
      res
        .status(StatusCodeEnums.OK_200)
        .json({ statistic: result, message: "This method is called" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HistoryController;
