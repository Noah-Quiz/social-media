const { default: mongoose } = require("mongoose");
const AdvertisementPackage = require("../entities/AdvertisementPackage");
const CreateAPackageDto = require("../dtos/AdvertisementPackage/CreateAPackageDto");
const UpdateAPackageDto = require("../dtos/AdvertisementPackage/UpdateAPackageDto");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
class AdvertisementPackageRepository {
  async createAdvertisementPackageRepository(coin, dateUnit, numberOfDateUnit) {
    try {
      const createAPackageDto = new CreateAPackageDto(
        coin,
        dateUnit,
        numberOfDateUnit
      );
      createAPackageDto.validate();
      const advertisementPackage = await AdvertisementPackage.create({
        coin,
        dateUnit,
        numberOfDateUnit,
      });
      return advertisementPackage;
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.InternalServerError_500,
        `Error creating advertisement package: ${error.message}`
      );
    }
  }

  async updateAPackageByIdRepository(id, coin, dateUnit, numberOfDateUnit) {
    try {
      const updateAPackageDto = new UpdateAPackageDto(
        id,
        coin,
        dateUnit,
        numberOfDateUnit
      );
      updateAPackageDto.validate();
      const advertisementPackage = await AdvertisementPackage.findByIdAndUpdate(
        id,
        { coin, dateUnit, numberOfDateUnit },
        { new: true }
      );
      return advertisementPackage;
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.InternalServerError_500,
        `Error updating advertisement package: ${error.message}`
      );
    }
  }

  async getAllAvailablePackagesRepository() {
    try {
      const advertisementPackages = await AdvertisementPackage.find({
        status: "ACTIVE",
        isDeleted: false,
      });
      return advertisementPackages;
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.InternalServerError_500,
        `Error getting all advertisement packages: ${error.message}`
      );
    }
  }

  async deleteAPackageByIdRepository(id) {
    try {
      const advertisementPackage = await AdvertisementPackage.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );
      return advertisementPackage;
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.InternalServerError_500,
        `Error deleting advertisement package: ${error.message}`
      );
    }
  }

  async getAPackageByIdRepository(id) {
    try {
      const advertisementPackage = await AdvertisementPackage.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      });
      return advertisementPackage;
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.InternalServerError_500,
        `Error getting advertisement package: ${error.message}`
      );
    }
  }
}
module.exports = AdvertisementPackageRepository;
