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
}

module.exports = ReceiptRepository;
