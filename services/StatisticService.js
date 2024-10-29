const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");

const countNewUsersService = async () => {
  try {
    const connection = new DatabaseTransaction();
    const today =
      await connection.userRepository.countNewUsersTodayRepository();
    const thisWeek =
      await connection.userRepository.countNewUsersThisWeekRepository();
    const thisMonth =
      await connection.userRepository.countNewUsersThisMonthRepository();
    const monthly =
      await connection.userRepository.countNewUsersMonthlyRepository();
    return {
      today,
      thisWeek,
      thisMonth,
      monthly,
    };
  } catch (error) {
    throw error;
  }
};

const countRevenueService = async () => {
  try {
    const connection = new DatabaseTransaction();
    const today =
      await connection.giftHistoryRepository.countTodayRevenueRepository();
    const thisWeek =
      await connection.giftHistoryRepository.countThisWeekRevenueRepository();
    const thisMonth =
      await connection.giftHistoryRepository.countThisMonthRevenue();
    const monthly =
      await connection.giftHistoryRepository.countMonthlyRevenue();
    const total =
      await connection.giftHistoryRepository.countTotalRevenueRepository();
    return {
      today,
      thisWeek,
      thisMonth,
      monthly,
      total,
    };
  } catch (error) {
    throw error;
  }
};

const countStreamsService = async () => {
  try {
    const connection = new DatabaseTransaction();
    const today =
      await connection.streamRepository.countTodayStreamsRepository();
    const thisWeek =
      await connection.streamRepository.countThisWeekStreamsRepository();
    const thisMonth =
      await connection.streamRepository.countThisMonthStreamsRepository();
    const monthly =
      await connection.streamRepository.countMonthlyStreamsRepository();
    const total =
      await connection.streamRepository.countTotalStreamsRepository();
    return {
      today,
      thisWeek,
      thisMonth,
      monthly,
      total,
    };
  } catch (error) {
    throw error;
  }
};

const countVideosService = async () => {
  try {
    const connection = new DatabaseTransaction();
    const today = await connection.videoRepository.countTodayVideosRepository();
    const thisWeek =
      await connection.videoRepository.countThisWeekVideosRepository();
    const thisMonth =
      await connection.videoRepository.countThisMonthVideosRepository();
    const monthly =
      await connection.videoRepository.countMonthlyVideosRepository();
    const total = await connection.videoRepository.countTotalVideosRepository();
    return {
      today,
      thisWeek,
      thisMonth,
      monthly,
      total,
    };
  } catch (error) {
    throw error;
  }
};

const calculateStreamViewsService = async () => {
  try {
    const connection = new DatabaseTransaction();
    const average =
      await connection.streamRepository.calculateAvgViewsRepository();
    const highest =
      await connection.streamRepository.calculateHighestViewsRepository();
    const lowest =
      await connection.streamRepository.calculateLowestViewsRepository();
    return { highest, lowest, average };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  countNewUsersService,
  countRevenueService,
  countStreamsService,
  countVideosService,
  calculateStreamViewsService,
};
