// File: repositories/ReceiptRepository.js
const Receipt = require("../entities/ReceiptEntity");

class ReceiptRepository {
  async createReceiptRepository(
    userId,
    paymentMethod,
    paymentPort,
    bankCode,
    amount,
    transactionId,
    type,
    exchangeRate
  ) {
    try {
      const receipt = await Receipt.create({
        userId,
        paymentMethod,
        paymentPort,
        bankCode,
        amount,
        transactionId,
        type,
        exchangeRate,
      });
      return receipt;
    } catch (error) {
      throw new Error(`Error creating receipt: ${error.message}`);
    }
  }

  async findByIdRepository(id) {
    try {
      const receipt = await Receipt.findOne({ _id: id, isDeleted: false });
      return receipt;
    } catch (error) {
      throw new Error(`Error fetching receipt by ID: ${error.message}`);
    }
  }

  async findByUserIdRepository(userId) {
    try {
      const receipts = await Receipt.find({ userId, isDeleted: false }).sort({
        dateCreated: -1,
      });
      return receipts;
    } catch (error) {
      throw new Error(`Error fetching receipts for user: ${error.message}`);
    }
  }

  async softDeleteRepository(id) {
    try {
      const receipt = await Receipt.findOneAndUpdate(
        { _id: id },
        { $set: { isDeleted: true, lastUpdated: Date.now() } }, // Ensure lastUpdated timestamp updates
        { new: true }
      );
      return receipt;
    } catch (error) {
      throw new Error(`Error deleting receipt: ${error.message}`);
    }
  }

  async countTotalRevenueRepository() {
    const result = await Receipt.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);
    return result.length > 0 ? result[0].totalAmount : 0;
  }

  async countTodayRevenueRepository() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const result = await Receipt.aggregate([
      { $match: { dateCreated: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);
    return result.length > 0 ? result[0].totalAmount : 0;
  }

  async countThisWeekRevenueRepository() {
    const today = new Date();
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    startOfWeek.setHours(0, 0, 0, 0);

    const result = await Receipt.aggregate([
      { $match: { dateCreated: { $gte: startOfWeek } } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);
    return result.length > 0 ? result[0].totalAmount : 0;
  }

  async countThisMonthRevenue() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await Receipt.aggregate([
      { $match: { dateCreated: { $gte: startOfMonth } } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);
    return result.length > 0 ? result[0].totalAmount : 0;
  }

  async countMonthlyRevenue() {
    const result = await Receipt.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$dateCreated" },
            month: { $month: "$dateCreated" },
          },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }, // Sắp xếp theo thứ tự tháng
    ]);
    return result;
  }
}

module.exports = ReceiptRepository;
