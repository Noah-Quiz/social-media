const StatusCodeEnums = require("../enums/StatusCodeEnum");
const {
  createAPackageService,
  getAllAvailablePackageService,
  updateAPackageByIdService,
  getAPackageByIdService,
  deleteAPackageByIdService,
} = require("../services/AdvertisementPackageService");

class AdvertisementPackageController {
  async createAPackageController(req, res) {
    const { coin, dateUnit, numberOfDateUnit } = req.body;
    try {
      const result = await createAPackageService(
        coin,
        dateUnit,
        numberOfDateUnit
      );
      return res.status(StatusCodeEnums.OK_200).json(result);
    } catch (error) {
      return res
        .status(StatusCodeEnums.InternalServerError_500)
        .json({ message: error.message });
    }
  }

  async getAllAvailablePackageController(req, res) {
    try {
      const result = await getAllAvailablePackageService();
      return res.status(StatusCodeEnums.OK_200).json(result);
    } catch (error) {
      return res
        .status(StatusCodeEnums.InternalServerError_500)
        .json({ message: error.message });
    }
  }

  async getAPackageByIdController(req, res) {
    const { id } = req.params;
    try {
      const result = await getAPackageByIdService(id);
      return res.status(StatusCodeEnums.OK_200).json(result);
    } catch (error) {
      return res
        .status(StatusCodeEnums.InternalServerError_500)
        .json({ message: error.message });
    }
  }

  async updateAPackageByIdController(req, res) {
    const { id, coin, dateUnit, numberOfDateUnit } = req.body;

    try {
      const result = await updateAPackageByIdService(
        id,
        coin,
        dateUnit,
        numberOfDateUnit
      );
      return res.status(StatusCodeEnums.OK_200).json(result);
    } catch (error) {
      return res
        .status(StatusCodeEnums.InternalServerError_500)
        .json({ message: error.message });
    }
  }

  async deleteAPackageByIdController(req, res) {
    const { id } = req.params;
    try {
      const result = await deleteAPackageByIdService(id);
      return res.status(StatusCodeEnums.OK_200).json(result);
    } catch (error) {
      return res
        .status(StatusCodeEnums.InternalServerError_500)
        .json({ message: error.message });
    }
  }
}

module.exports = AdvertisementPackageController;
