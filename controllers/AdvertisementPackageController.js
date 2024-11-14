const StatusCodeEnums = require("../enums/StatusCodeEnum");
const {
  createAPackageService,
  getAllAvailablePackageService,
  updateAPackageByIdService,
  getAPackageByIdService,
  deleteAPackageByIdService,
} = require("../services/AdvertisementPackageService");
const createAPackageDto = require("../dtos/AdvertisementPackage/CreateAPackageDto");
const updateAPackageDto = require("../dtos/AdvertisementPackage/UpdateAPackageDto");
class AdvertisementPackageController {
  async createAPackageController(req, res, next) {
    const { coin, dateUnit, numberOfDateUnit } = req.body;
    try {
      const create = new createAPackageDto(coin, dateUnit, numberOfDateUnit);
      await create.validate();
      const result = await createAPackageService(
        coin,
        dateUnit,
        numberOfDateUnit
      );
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ packages: result, message: "Created successfully" });
    } catch (error) {
      next(error);
    }
  }

  async getAllAvailablePackageController(req, res, next) {
    try {
      const result = await getAllAvailablePackageService();
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ packages: result, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async getAPackageByIdController(req, res, next) {
    const { id } = req.params;
    try {
      const result = await getAPackageByIdService(id);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ package: result, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async updateAPackageByIdController(req, res, next) {
    const { coin, dateUnit, numberOfDateUnit } = req.body;
    const { id } = req.params;
    try {
      const update = new updateAPackageDto(
        id,
        coin,
        dateUnit,
        numberOfDateUnit
      );
      await update.validate();
      const result = await updateAPackageByIdService(
        id,
        coin,
        dateUnit,
        numberOfDateUnit
      );
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ package: result, message: "Update successfully" });
    } catch (error) {
      next(error);
    }
  }

  async deleteAPackageByIdController(req, res, next) {
    const { id } = req.params;
    try {
      const result = await deleteAPackageByIdService(id);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ package: result, message: "Deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdvertisementPackageController;
