const StatusCodeEnums = require("../enums/StatusCodeEnum");
const UserEnum = require("../enums/UserEnum");
const CoreException = require("../exceptions/CoreException");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");

const createHistoryRecordService = async (data) => {
  try {
    const connection = new DatabaseTransaction();
    const checkUser = await connection.userRepository.getAnUserByIdRepository(
      data.userId
    );
    if (!checkUser || checkUser === false) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "User not found");
    }
    const checkVideo = await connection.videoRepository.getVideoByIdRepository(
      data.videoId
    );
    if (!checkVideo) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Video not found"
      );
    }
    const historyRecord =
      await connection.historyRepository.createHistoryRecordRepository(data);

    return historyRecord;
  } catch (error) {
    throw error;
  }
};

const clearAllHistoryRecordsService = async (userId) => {
  try {
    const connection = new DatabaseTransaction();

    const user = await connection.userRepository.getAnUserByIdRepository(
      userId
    );
    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }

    const result =
      await connection.historyRepository.clearAllHistoryRecordsRepository(
        userId
      );

    return result;
  } catch (error) {
    throw error;
  }
};

const deleteHistoryRecordService = async (historyId, userId) => {
  try {
    const connection = new DatabaseTransaction();

    const user = await connection.userRepository.getAnUserByIdRepository(
      userId
    );
    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }

    const historyRecord =
      await connection.historyRepository.getHistoryRecordRepository(historyId);

    if (!historyRecord) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "History record not found"
      );
    }

    if (user.role !== UserEnum.ADMIN && historyRecord.userId !== userId) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You are not authorized to delete this history record"
      );
    }

    await connection.historyRepository.deleteHistoryRecordRepository(historyId);

    return;
  } catch (error) {
    throw error;
  }
};

const getAllHistoryRecordsService = async (userId, query) => {
  try {
    const connection = new DatabaseTransaction();

    const data =
      await connection.historyRepository.getAllHistoryRecordsRepository(
        userId,
        query
      );

    return data;
  } catch (error) {
    throw error;
  }
};

const getViewStatisticService = async (ownerId, userId, TimeUnit, value) => {
  try {
    const connection = new DatabaseTransaction();
    const checkOwner = await connection.userRepository.getAnUserByIdRepository(
      ownerId
    );
    if (!checkOwner || checkOwner === false) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Owner not found");
    }
    const checkRequester =
      await connection.userRepository.getAnUserByIdRepository(userId);
    if (!checkRequester || checkRequester === false) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Requester not found"
      );
    }

    const isOwner = ownerId?.toString() === userId?.toString();
    const isAdmin = checkRequester.role === UserEnum.ADMIN;

    // console.log("Owner: ", isOwner, "Admin: ", isAdmin);

    if (!isOwner && !isAdmin) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You do not have permission to perform this action"
      );
    }
    const data = await connection.historyRepository.getViewStatisticRepository(
      ownerId,
      TimeUnit,
      value
    );
    return data;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createHistoryRecordService,
  clearAllHistoryRecordsService,
  getAllHistoryRecordsService,
  deleteHistoryRecordService,
  getViewStatisticService,
};
