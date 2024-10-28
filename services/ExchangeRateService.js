const DatabaseTransaction = require("../repositories/DatabaseTransaction");

const createExchangeRateService = async (name, value, description) => {
  const connection = new DatabaseTransaction();
  try {
    const exchangeRate =
      await connection.exchangeRateRepository.createNewExchangeRateRepository({
        name: name,
        value: value,
        description: description,
      });
    return exchangeRate;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getExchangeRateService = async () => {
  const connection = new DatabaseTransaction();
  try {
    const exchangeRates =
      await connection.exchangeRateRepository.getAllRatesAsObjectRepository();
    return exchangeRates;
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateExchangeRateService = async (id, value, description) => {
  const connection = new DatabaseTransaction();
  try {
    const exchangeRate =
      await connection.exchangeRateRepository.updateRateRepository(
        { id }, // Passing id as an object
        value,
        description
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
      await connection.exchangeRateRepository.softDeleteRateRepository({ id });
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
