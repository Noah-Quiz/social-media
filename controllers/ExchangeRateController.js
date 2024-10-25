const CreateExchangeRateDto = require("../dtos/ExchangeRate/CreateExchangeRateDto");
const UpdateExchangeRateDto = require("../dtos/ExchangeRate/UpdateExchangeRateDto");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const {
  createExchangeRateService,
  deleteExchangeRateService,
  getExchangeRateService,
  updateExchangeRateService,
} = require("../services/ExchangeRateService");

class ExchangeRateController {
  async createExchangeRateController(req, res) {
    const { name, value = 1, description } = req.body;
    if (!name || !value) {
      res
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Please fill in all required fields" });
    }
    if (isNaN(value)) {
      res
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Value must be a number" });
    }
    try {
      const createExchangeRateDto = new CreateExchangeRateDto(
        name,
        value,
        description
      );
      await createExchangeRateDto.validate();

      const result = await createExchangeRateService(name, value, description);
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
      const { value, description } = req.body;
      const updateExchangeRateDto = new UpdateExchangeRateDto(
        id,
        value,
        description
      );
      await updateExchangeRateDto.validate();

      const result = await updateExchangeRateService(id, value, description);
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
