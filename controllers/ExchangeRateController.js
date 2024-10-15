const {
  createExchangeRateService,
  deleteExchangeRateService,
  getExchangeRateService,
  updateExchangeRateService,
} = require("../services/ExchangeRateService");

class ExchangeRateController {
  async createExchangeRateController(req, res) {
    const {
      topUpBalanceRate = 1,
      topUpCoinRate = 1000,
      exchangeRateBalanceToCoin = 1000,
      exchangeRateCoinToBalance = 0.0008,
      coinPer1000View = 100000,
    } = req.body;

    // Validate number fields directly
    const numberFields = {
      topUpBalanceRate,
      topUpCoinRate,
      exchangeRateBalanceToCoin,
      exchangeRateCoinToBalance,
      coinPer1000View,
    };
    for (const [key, value] of Object.entries(numberFields)) {
      if (value !== undefined && (typeof value !== "number" || isNaN(value))) {
        return res
          .status(400)
          .json({ message: `Invalid field: ${key} must be a valid number.` });
      }
    }

    try {
      const result = await createExchangeRateService(
        topUpBalanceRate,
        topUpCoinRate,
        exchangeRateBalanceToCoin,
        exchangeRateCoinToBalance,
        coinPer1000View
      );
      res.status(201).json({ exchangeRate: result, message: "Success" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteExchangeRateController(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
      const result = await deleteExchangeRateService(id);
      return res.status(200).json({ exchangeRate: result, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async updateExchangeRateController(req, res) {
    const { id } = req.params;
    const {
      topUpBalanceRate,
      topUpCoinRate,
      exchangeRateBalanceToCoin,
      exchangeRateCoinToBalance,
      coinPer1000View,
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Validate number fields directly
    const numberFields = {
      topUpBalanceRate,
      topUpCoinRate,
      exchangeRateBalanceToCoin,
      exchangeRateCoinToBalance,
      coinPer1000View,
    };
    for (const [key, value] of Object.entries(numberFields)) {
      if (value !== undefined && (typeof value !== "number" || isNaN(value))) {
        return res
          .status(400)
          .json({ message: `Invalid field: ${key} must be a valid number.` });
      }
    }

    try {
      const result = await updateExchangeRateService(
        id,
        topUpBalanceRate,
        topUpCoinRate,
        exchangeRateBalanceToCoin,
        exchangeRateCoinToBalance,
        coinPer1000View
      );
      res.status(200).json({ exchangeRate: result, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getExchangeRateController(req, res) {
    try {
      const result = await getExchangeRateService();
      return res.status(200).json({ exchangeRate: result, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = ExchangeRateController;
