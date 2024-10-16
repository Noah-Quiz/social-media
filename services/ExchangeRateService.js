const DatabaseTransaction = require("../repositories/DatabaseTransaction");

const createExchangeRateService = async (
  topUpBalanceRate,
  topUpCoinRate,
  exchangeRateBalanceToCoin,
  exchangeRateCoinToBalance,
  coinPer1000View
) => {
  const connection = new DatabaseTransaction();
  try {
    const ExchangeRate =
      await connection.exchangeRateRepository.createNewExchangeRateRepository(
        topUpBalanceRate,
        topUpCoinRate,
        exchangeRateBalanceToCoin,
        exchangeRateCoinToBalance,
        coinPer1000View
      );
    return ExchangeRate;
  } catch (error) {
    throw new Error(error.message);
  }
};
const getExchangeRateService = async () => {
  const connection = new DatabaseTransaction();
  try {
    const exchangeRate =
      await connection.exchangeRateRepository.getCurrentRateRepository();
    return exchangeRate;
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateExchangeRateService = async (
  id,
  topUpBalanceRate,
  topUpCoinRate,
  exchangeRateBalanceToCoin,
  exchangeRateCoinToBalance,
  coinPer1000View
) => {
  const connection = new DatabaseTransaction();
  try {
    const exchangeRate =
      await connection.exchangeRateRepository.updateExchangeRateRepository(
        id,
        topUpBalanceRate,
        topUpCoinRate,
        exchangeRateBalanceToCoin,
        exchangeRateCoinToBalance,
        coinPer1000View
      );
    return exchangeRate;
  } catch (error) {
    throw new Error(error.message);
  }
};
const deleteExchangeRateService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const exchangeRate =
      await connection.exchangeRateRepository.softDeleteExchangeRateRepository(
        id
      );
    return exchangeRate;
  } catch (error) {
    throw new Error(error.message);
  }
};
module.exports = {
  getExchangeRateService,
  updateExchangeRateService,
  createExchangeRateService,
  deleteExchangeRateService,
};
