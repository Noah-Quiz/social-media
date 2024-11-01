const StatusCodeEnums = require("../enums/StatusCodeEnum");
const {
  createAPackageService,
  getAllAvailablePackageService,
  updateAPackageByIdService,
  getAPackageByIdService,
  deleteAPackageByIdService,
} = require("../services/AdvertisementPackageService");

class AdvertisementPackageController {
  async createAPackageController(req, res, next) {
    const { coin, dateUnit, numberOfDateUnit } = req.body;
    try {
      const result = await createAPackageService(
        coin,
        dateUnit,
        numberOfDateUnit
      );
      return res.status(StatusCodeEnums.OK_200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAllAvailablePackageController(req, res, next) {
    try {
      const result = await getAllAvailablePackageService();
      return res.status(StatusCodeEnums.OK_200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAPackageByIdController(req, res, next) {
    const { id } = req.params;
    try {
      const result = await getAPackageByIdService(id);
      return res.status(StatusCodeEnums.OK_200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateAPackageByIdController(req, res, next) {
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
      next(error);
    }
  }

  async deleteAPackageByIdController(req, res, next) {
    const { id } = req.params;
    try {
      const result = await deleteAPackageByIdService(id);
      return res.status(StatusCodeEnums.OK_200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdvertisementPackageController;
