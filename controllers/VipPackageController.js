const CreateVipPackageDto = require("../dtos/VipPackage/CreateVipPackageDto");
const UpdateVipPackageDto = require("../dtos/VipPackage/UpdateVipPackageDto");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const {
  createVipPackageService,
  deleteVipPackageService,
  getAllVipPackageService,
  getVipPackageService,
  updateVipPackageService,
} = require("../services/VipPackageService");

class VipPackageController {
  async getAllVipPackage(req, res, next) {
    try {
      const result = await getAllVipPackageService();
      res.status(StatusCodeEnums.OK_200).json({
        Packages: result,
        message: "Get all vip packages successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  async getAVipPackage(req, res, next) {
    const { id } = req.params;
    try {
      const result = await getVipPackageService(id);
      res.status(StatusCodeEnums.OK_200).json({
        Packages: result,
        message: "Get one vip package successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  async createVipPackageController(req, res, next) {
    try {
      const { name, description, price, durationUnit, durationNumber } =
        req.body;
      const createVipPackageDto = new CreateVipPackageDto(
        name,
        description,
        price,
        durationUnit,
        durationNumber
      );
      await createVipPackageDto.validate();
      const result = await createVipPackageService(
        name,
        description,
        price,
        durationUnit,
        durationNumber
      );
      res.status(StatusCodeEnums.Created_201).json({
        package: result,
        message: "Create vip package successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateVipPackageController(req, res, next) {
    const { id } = req.params;
    try {
      const { name, description, price, durationUnit, durationNumber } =
        req.body;

      // Create and validate DTO
      const updateVipPackageDto = new UpdateVipPackageDto({
        id,
        name,
        description,
        price,
        durationUnit,
        durationNumber,
      });
      await updateVipPackageDto.validate();

      const result = await updateVipPackageService(
        id,
        name,
        description,
        price,
        durationUnit,
        durationNumber
      );
      res
        .status(StatusCodeEnums.OK_200)
        .json({ package: result, message: "Updated successfully" });
    } catch (error) {
      next(error);
    }
  }
  async deleteVipPackageController(req, res, next) {
    const { id } = req.params;
    try {
      const result = await deleteVipPackageService(id);
      res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = VipPackageController;
