const CreateExchangeRateDto = require("../dtos/ExchangeRate/CreateExchangeRateDto");
const UpdateExchangeRateDto = require("../dtos/ExchangeRate/UpdateExchangeRateDto");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const {
  createExchangeRateService,
  deleteExchangeRateService,
  getExchangeRateService,
  updateExchangeRateService,
  getSingleExchangeRateService,
} = require("../services/ExchangeRateService");

class ExchangeRateController {
  async createExchangeRateController(req, res, next) {
    try {
      const { name, value = 1, description } = req.body;
      if (!name || !value) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid input"
        );
      }
      if (isNaN(value)) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid value"
        );
      }
      const createExchangeRateDto = new CreateExchangeRateDto(
        name,
        value,
        description
      );
      await createExchangeRateDto.validate();

      const result = await createExchangeRateService(name, value, description);
      res
        .status(StatusCodeEnums.Created_201)
        .json({ exchangeRate: result, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async deleteExchangeRateController(req, res, next) {
    try {
      // const { id } = req.params;
      const { id, name } = req.query;
      console.log(name);
      if (!name) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid input"
        );
      }

      const result = await deleteExchangeRateService(id, name);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ exchangeRate: result, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async updateExchangeRateController(req, res, next) {
    try {
      // const { id } = req.params;
      const { id, name, value, description } = req.body;
      const updateExchangeRateDto = new UpdateExchangeRateDto(
        id,
        name,
        value,
        description
      );
      await updateExchangeRateDto.validate();

      const result = await updateExchangeRateService(
        id,
        name,
        value,
        description
      );
      res
        .status(StatusCodeEnums.OK_200)
        .json({ exchangeRate: result, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async getExchangeRateController(req, res, next) {
    try {
      const result = await getExchangeRateService();
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ exchangeRate: result, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async getOneExchangeRate(req, res, next) {
    try {
      const { id, name } = req.query; // Use query parameters
      if (!id && !name) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Either id or name must be provided"
        );
      }
      const result = await getSingleExchangeRateService(id, name);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ exchangeRate: result, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ExchangeRateController;
