const CreateExchangeRateDto = require("../dtos/ExchangeRate/CreateExchangeRateDto");
const UpdateExchangeRateDto = require("../dtos/ExchangeRate/UpdateExchangeRateDto");
const {
  createExchangeRateService,
  deleteExchangeRateService,
  getExchangeRateService,
  updateExchangeRateService,
} = require("../services/ExchangeRateService");

class ExchangeRateController {
  async createExchangeRateController(req, res) {
    try {
      const {
        topUpBalanceRate = 1,
        topUpCoinRate = 1000,
        exchangeRateBalanceToCoin = 1000,
        exchangeRateCoinToBalance = 0.0008,
        coinPer1000View = 100000,
      } = req.body;
      const createExchangeRateDto = new CreateExchangeRateDto(
        topUpBalanceRate,
        topUpCoinRate,
        exchangeRateBalanceToCoin,
        exchangeRateCoinToBalance,
        coinPer1000View
      );
      await createExchangeRateDto.validate();

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
    try {
      const { id } = req.params;
      const {
        topUpBalanceRate,
        topUpCoinRate,
        exchangeRateBalanceToCoin,
        exchangeRateCoinToBalance,
        coinPer1000View,
      } = req.body;
      const updateExchangeRateDto = new UpdateExchangeRateDto(
        id,
        topUpBalanceRate,
        topUpCoinRate,
        exchangeRateBalanceToCoin,
        exchangeRateCoinToBalance,
        coinPer1000View
      );
      await updateExchangeRateDto.validate();

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
