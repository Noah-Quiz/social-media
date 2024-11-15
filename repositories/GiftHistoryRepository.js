const GiftHistory = require("../entities/GiftHistoryEntity");
const DatabaseTransaction = require("./DatabaseTransaction");
const ExchangeRateRepository = require("./ExchangeRateRepository");
class GiftHistoryRepository {
  constructor() {
    this.exchangeRateRepository = new ExchangeRateRepository();
  }
  async createGiftHistoryRepository(
    streamId,
    streamTitle,
    streamThumbnail,
    userId,
    gifts
  ) {
    try {
      const existingHistory = await this.findExistingHistory(streamId, userId);
      const rate =
        await this.exchangeRateRepository.getAllRatesAsObjectRepository();

      if (existingHistory && existingHistory.length > 0) {
        const history = existingHistory[0]; // Get the existing record

        // Update existing  history with new gifts or new quantity
        gifts.forEach((newGift) => {
          const existingGiftIndex = history.gifts.findIndex(
            (g) => g.giftId?.toString() === newGift.giftId?.toString()
          );

          if (existingGiftIndex >= 0) {
            // Update quantity of existing gift
            history.gifts[existingGiftIndex].quantity += newGift.quantity;
          } else {
            // Add new gift
            history.gifts.push(newGift);
          }
        });

        // Update total
        history.total += gifts.reduce(
          (acc, gift) => acc + gift.quantity * gift.pricePerUnit,
          0
        );

        history.streamerTotal +=
          gifts.reduce(
            (acc, gift) => acc + gift.quantity * gift.pricePerUnit,
            0
          ) * rate.ReceivePercentage;
        // Save the updated history
        await history.save();
        return await GiftHistory.findOne({
          _id: history._id,
          isDeleted: false,
        }).lean();
      } else {
        // Create new gift history if none exists
        const newGiftHistory = new GiftHistory({
          streamId,
          streamTitle,
          streamThumbnail,
          userId,
          gifts,
          total: gifts.reduce(
            (acc, gift) => acc + gift.quantity * gift.pricePerUnit,
            0
          ),
          streamerTotal:
            gifts.reduce(
              (acc, gift) => acc + gift.quantity * gift.pricePerUnit,
              0
            ) * rate.ReceivePercentage,
        });
        console.log();
        // Save the new gift history
        const savedHistory = await newGiftHistory.save();

        // Retrieve the new document as a plain object
        return await GiftHistory.findById(savedHistory._id).lean(); // Returning the plain object
      }
    } catch (error) {
      throw new Error(
        "Error creating or updating gift history: " + error.message
      );
    }
  }
  async findExistingHistory(streamId, userId) {
    try {
      const existingHistory = await GiftHistory.find({
        streamId: streamId,
        userId: userId,
        isDeleted: false,
      });
      return existingHistory;
    } catch (error) {
      throw new Error("Error finding existing history: ", error.message);
    }
  }
  async getGiftHistoryRepository(id) {
    try {
      const giftHistory = await GiftHistory.findOne({
        _id: id,
        isDeleted: false,
      }).lean();
      return giftHistory;
    } catch (error) {
      throw new Error("Error getting gift history:", error.message);
    }
  }
  async getGiftHistoryByStreamIdRepository(streamId) {
    try {
      const giftHistories = await GiftHistory.find({
        streamId: streamId,
        isDeleted: false,
      }).lean();
      return giftHistories;
    } catch (error) {
      throw new Error(
        "Error getting gift history by stream id:",
        error.message
      );
    }
  }
  async getGiftHistoryByUserIdRepository(userId) {
    try {
      const giftHistories = await GiftHistory.find({
        userId: userId,
        isDeleted: false,
      }).lean();
      return giftHistories;
    } catch (error) {
      throw new Error("Error getting gift history by user id:", error.message);
    }
  }
  async deleteGiftHistoryRepository(id) {
    try {
      const giftHistory = await GiftHistory.findByIdAndUpdate(id, {
        $set: { isDeleted: true },
      }).lean();
      return giftHistory;
    } catch (error) {
      throw new Error("Error deleting gift history:", error.message);
    }
  }

  async countTotalRevenueRepository() {
    try {
      const result = await GiftHistory.aggregate([
        {
          $project: {
            revenue: { $subtract: ["$total", "$streamerTotal"] }, // Calculate total - streamerTotal for each document
          },
        },
        { $group: { _id: null, totalAmount: { $sum: "$revenue" } } },
      ]);
      const rate =
        await this.exchangeRateRepository.getAllRatesAsObjectRepository();
      return result.length > 0
        ? result[0].totalAmount * rate.exchangeRateCoinToBalance
        : 0;
    } catch (error) {
      console.log(error);
      throw new Error("Error counting total revenue: ", error.message);
    }
  }

  async countTodayRevenueRepository() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const result = await GiftHistory.aggregate([
      { $match: { dateCreated: { $gte: startOfDay, $lte: endOfDay } } },
      {
        $project: {
          revenue: { $subtract: ["$total", "$streamerTotal"] }, // Calculate total - streamerTotal for each document
        },
      },
      { $group: { _id: null, totalAmount: { $sum: "$revenue" } } },
    ]);
    const rate =
      await this.exchangeRateRepository.getAllRatesAsObjectRepository();
    return result.length > 0
      ? result[0].totalAmount * rate.exchangeRateCoinToBalance
      : 0;
  }

  async countThisWeekRevenueRepository() {
    const today = new Date();
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    startOfWeek.setHours(0, 0, 0, 0);

    const result = await GiftHistory.aggregate([
      { $match: { dateCreated: { $gte: startOfWeek } } },
      {
        $project: {
          revenue: { $subtract: ["$total", "$streamerTotal"] }, // Calculate total - streamerTotal for each document
        },
      },
      { $group: { _id: null, totalAmount: { $sum: "$revenue" } } },
    ]);
    const rate =
      await this.exchangeRateRepository.getAllRatesAsObjectRepository();
    return result.length > 0
      ? result[0].totalAmount * rate.exchangeRateCoinToBalance
      : 0;
  }

  async countThisMonthRevenue() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await GiftHistory.aggregate([
      { $match: { dateCreated: { $gte: startOfMonth } } },
      {
        $project: {
          revenue: { $subtract: ["$total", "$streamerTotal"] }, // Calculate total - streamerTotal for each document
        },
      },
      { $group: { _id: null, totalAmount: { $sum: "$revenue" } } },
    ]);
    const rate =
      await this.exchangeRateRepository.getAllRatesAsObjectRepository();
    return result.length > 0
      ? result[0].totalAmount * rate.exchangeRateCoinToBalance
      : 0;
  }

  async countMonthlyRevenue() {
    const result = await GiftHistory.aggregate([
      {
        $project: {
          year: { $year: "$dateCreated" },
          month: { $month: "$dateCreated" },
          revenue: { $subtract: ["$total", "$streamerTotal"] }, // Calculate total - streamerTotal for each document
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalAmount: { $sum: "$revenue" }, // Sum the calculated differences for each month
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }, // Sort by year and month in ascending order
    ]);
    const rate =
      await this.exchangeRateRepository.getAllRatesAsObjectRepository();
    return result.map((r) => ({
      year: r._id.year,
      month: r._id.month,
      totalAmount: r.totalAmount * rate.exchangeRateCoinToBalance,
    }));
  }
}

module.exports = GiftHistoryRepository;
