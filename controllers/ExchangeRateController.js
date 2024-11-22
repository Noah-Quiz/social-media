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
  // Create Exchange Rate
  async createExchangeRateController(req, res, next) {
    try {
      const { name, value = 1, description } = req.body;
      if (!name || isNaN(value)) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid name or value"
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

  // Delete Exchange Rate by ID
  async deleteExchangeRateByIdController(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "ID is required"
        );
      }
      const result = await deleteExchangeRateService(id, null);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ exchangeRate: result, message: "Deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  // Delete Exchange Rate by Name
  async deleteExchangeRateByNameController(req, res, next) {
    try {
      const { name } = req.query;
      if (!name) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Name is required"
        );
      }
      const result = await deleteExchangeRateService(null, name);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ exchangeRate: result, message: "Deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  // Update Exchange Rate by ID
  async updateExchangeRateByIdController(req, res, next) {
    try {
      const { id } = req.params;
      const { value, description } = req.body;
      if (!id) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "ID is required"
        );
      }
      const updateExchangeRateDto = new UpdateExchangeRateDto(
        id,
        null,
        value,
        description
      );
      await updateExchangeRateDto.validate();
      const result = await updateExchangeRateService(
        id,
        null,
        value,
        description
      );
      res
        .status(StatusCodeEnums.OK_200)
        .json({ exchangeRate: result, message: "Updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  // Update Exchange Rate by Name
  async updateExchangeRateByNameController(req, res, next) {
    try {
      const { name } = req.query;
      const { value, description } = req.body;
      if (!name) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Name is required"
        );
      }
      const updateExchangeRateDto = new UpdateExchangeRateDto(
        null,
        name,
        value,
        description
      );
      await updateExchangeRateDto.validate();
      const result = await updateExchangeRateService(
        null,
        name,
        value,
        description
      );
      res
        .status(StatusCodeEnums.OK_200)
        .json({ exchangeRate: result, message: "Updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  // Get Exchange Rate by ID
  async getExchangeRateByIdController(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "ID is required"
        );
      }
      const result = await getSingleExchangeRateService(id, null);
      res
        .status(StatusCodeEnums.OK_200)
        .json({ exchangeRate: result, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  // Get Exchange Rate by Name
  async getExchangeRateByNameController(req, res, next) {
    try {
      const { name } = req.query;
      if (!name) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Name is required"
        );
      }
      const result = await getSingleExchangeRateService(null, name);
      res
        .status(StatusCodeEnums.OK_200)
        .json({ exchangeRate: result, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  // Get All Exchange Rates
  async getAllExchangeRatesController(req, res, next) {
    try {
      const result = await getExchangeRateService();
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ exchangeRates: result, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ExchangeRateController;
