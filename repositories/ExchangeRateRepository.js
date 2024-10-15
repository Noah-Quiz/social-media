const ExchangeRate = require("../entities/ExchangeRateEntity");

class ExchangeRateRepository {
  async createNewExchangeRateRepository(
    topUpBalanceRate = 1,
    topUpCoinRate = 1000,
    exchangeRateBalanceToCoin = 1000,
    exchangeRateCoinToBalance = 0.0008,
    coinPer1000View = 100000
  ) {
    try {
      // Mark all previous rates as deleted
      await this.DeleteAllRateRepository();
      const newExchangeRate = await ExchangeRate.create({
        topUpBalanceRate,
        topUpCoinRate,
        exchangeRateBalanceToCoin,
        exchangeRateCoinToBalance,
        coinPer1000View,
      });
      return newExchangeRate;
    } catch (error) {
      throw new Error("Error creating new exchange rate: " + error.message);
    }
  }

  async DeleteAllRateRepository() {
    try {
      // Update many documents to mark them as deleted
      await ExchangeRate.updateMany(
        { isDeleted: false },
        { $set: { isDeleted: true } }
      );
    } catch (error) {
      throw new Error("Error deleting all exchange rates: " + error.message);
    }
  }

  async getCurrentRateRepository() {
    try {
      const currentRate = await ExchangeRate.findOne({ isDeleted: false });
      return currentRate;
    } catch (error) {
      throw new Error("Error getting current exchange rate: " + error.message);
    }
  }

  async softDeleteExchangeRateRepository(id) {
    try {
      const currentRate = await ExchangeRate.findOneAndUpdate(
        { _id: id },
        { $set: { isDeleted: true } },
        { new: true }
      );
      return currentRate;
    } catch (error) {
      throw new Error("Error soft deleting the rate: " + error.message);
    }
  }

  async updateExchangeRateRepository(
    id,
    topUpBalanceRate,
    topUpCoinRate,
    exchangeRateBalanceToCoin,
    exchangeRateCoinToBalance,
    coinPer1000View
  ) {
    try {
      const currentRate = await ExchangeRate.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!currentRate) {
        throw new Error("Exchange rate not found or is deleted.");
      }

      // Update fields only if they are provided and valid
      if (topUpBalanceRate !== undefined && topUpBalanceRate > 0) {
        currentRate.topUpBalanceRate = topUpBalanceRate;
      }
      if (topUpCoinRate !== undefined && topUpCoinRate > 0) {
        currentRate.topUpCoinRate = topUpCoinRate;
      }
      if (
        exchangeRateBalanceToCoin !== undefined &&
        exchangeRateBalanceToCoin > 0
      ) {
        currentRate.exchangeRateBalanceToCoin = exchangeRateBalanceToCoin;
      }
      if (
        exchangeRateCoinToBalance !== undefined &&
        exchangeRateCoinToBalance > 0
      ) {
        currentRate.exchangeRateCoinToBalance = exchangeRateCoinToBalance;
      }
      if (coinPer1000View !== undefined && coinPer1000View > 0) {
        currentRate.coinPer1000View = coinPer1000View;
      }
      await currentRate.save();
      return currentRate;
    } catch (error) {
      throw new Error("Error updating the rate: " + error.message);
    }
  }
}

module.exports = ExchangeRateRepository;
