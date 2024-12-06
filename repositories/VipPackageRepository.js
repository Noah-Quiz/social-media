const { default: mongoose } = require("mongoose");
const VipPackage = require("../entities/VipPackageEntity");
const CoreException = require("../exceptions/CoreException");
const StatusCodeEnums = require("../enums/StatusCodeEnum");

class VipPackageRepository {
  async createVipPackageRepository(data) {
    try {
      const vipPackage = await VipPackage.create(data);
      return vipPackage;
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.InternalServerError_500,
        `Error creating vip package: ${error.message}`
      );
    }
  }
  async getAllVipPackageRepository() {
    try {
      const vipPackages = await VipPackage.find({ isDeleted: false });
      return vipPackages;
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.InternalServerError_500,
        `Error getting all vip packages: ${error.message}`
      );
    }
  }
  async getVipPackageRepository(id) {
    try {
      const vipPackage = await VipPackage.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      });
      return vipPackage;
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.InternalServerError_500,
        `Error getting vipPackage: ${error.message}`
      );
    }
  }
  async updateVipPackageRepository(
    id,
    name,
    description,
    price,
    durationUnit,
    durationNumber
  ) {
    try {
      const vipPackage = await VipPackage.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      });
      if (name && name !== "" && name !== vipPackage.name) {
        vipPackage.name = name;
      }
      if (
        description &&
        description !== "" &&
        vipPackage.description !== description
      ) {
        vipPackage.description = description;
      }
      if (price && !isNaN(price) && price > 0 && price !== vipPackage.price) {
        vipPackage.price = price;
      }
      if (
        durationUnit &&
        durationNumber !== "" &&
        ["DAY", "MONTH", "YEAR"].includes(durationUnit)
      ) {
        vipPackage.durationUnit = durationUnit;
      }
      if (
        durationNumber &&
        !isNaN(durationNumber) &&
        durationNumber > 0 &&
        durationNumber !== vipPackage.durationNumber
      ) {
        vipPackage.durationNumber = durationNumber;
      }
      await vipPackage.save();
      return vipPackage;
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.InternalServerError_500,
        `Error updating vip package: ${error.message}`
      );
    }
  }
  async deleteVipPackageRepository(id) {
    try {
      const vipPackage = await VipPackage.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        { $set: { isDeleted: true, lastUpdated: Date.now() } },
        {
          new: true,
        }
      );
      return vipPackage;
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.InternalServerError_500,
        `Error delete vip package: ${error.message}`
      );
    }
  }
  async getVipPackageByName(name) {
    try {
      const vipPackage = await VipPackage.findOne({
        name: { $regex: new RegExp("^" + name + "$", "i") },
      });
      return vipPackage;
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.InternalServerError_500,
        `Error getting vip package by name: ${error.message}`
      );
    }
  }
}

module.exports = VipPackageRepository;
