const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
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

const updateExchangeRateService = async (id, name, value, description) => {
  const connection = new DatabaseTransaction();
  try {
    const checkExchangeRate =
      await connection.exchangeRateRepository.getCurrentRateRepository({
        name,
        id,
      });
    if (!checkExchangeRate) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Exchange rate not found"
      );
    }
    if (name && name != "" && checkExchangeRate.name !== name) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Exchange rate name are different from the provided name"
      );
    }
    const exchangeRate =
      await connection.exchangeRateRepository.updateRateRepository(
        { id, name },
        value,
        description
      );
    return exchangeRate;
  } catch (error) {
    throw new Error(error.message);
  }
};

const deleteExchangeRateService = async (id, name) => {
  const connection = new DatabaseTransaction();
  try {
    const checkExchangeRate =
      await connection.exchangeRateRepository.getCurrentRateRepository({
        name,
        id,
      });
    if (!checkExchangeRate) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Exchange rate not found"
      );
    }
    if (name && name != "" && checkExchangeRate.name !== name) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Exchange rate name are different from the provided name"
      );
    }
    const exchangeRate =
      await connection.exchangeRateRepository.softDeleteRateRepository({
        name,
        id,
      });
    return exchangeRate;
  } catch (error) {
    throw new Error(error.message);
  }
};
const getSingleExchangeRateService = async (id, name) => {
  const connection = new DatabaseTransaction();
  try {
    const exchangeRate =
      await connection.exchangeRateRepository.getCurrentRateRepository({
        name,
        id,
      });
    if (!exchangeRate) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Exchange rate not found"
      );
    }
    if (name && name != "" && exchangeRate.name !== name) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Exchange rate name are different from the provided name"
      );
    }
    return exchangeRate;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getExchangeRateService,
  updateExchangeRateService,
  createExchangeRateService,
  deleteExchangeRateService,
  getSingleExchangeRateService,
};
