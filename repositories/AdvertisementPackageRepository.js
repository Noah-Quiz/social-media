const { default: mongoose } = require("mongoose");
const AdvertisementPackage = require("../entities/AdvertisementPackage");

class AdvertisementPackageRepository {
  async createAdvertisementPackageRepository(coin, dateUnit, numberOfDateUnit) {
    try {
      const advertisementPackage = await AdvertisementPackage.create({
        coin,
        dateUnit,
        numberOfDateUnit,
      });
      return advertisementPackage;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateAPackageByIdRepository(id, coin, dateUnit, numberOfDateUnit) {
    try {
      const advertisementPackage = await AdvertisementPackage.findByIdAndUpdate(
        id,
        { coin, dateUnit, numberOfDateUnit },
        { new: true }
      );
      return advertisementPackage;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllAvailablePackagesRepository() {
    try {
      const advertisementPackages = await AdvertisementPackage.find({
        status: "ACTIVE",
      });
      return advertisementPackages;
    } catch (error) {
      throw new Error(error.message);
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
      throw new Error(error.message);
    }
  }

  async getAPackageByIdRepository(id) {
    try {
      console.log(id);
      const advertisementPackage = await AdvertisementPackage.findOne({
        _id: new mongoose.Types.ObjectId(id),
      });
      return advertisementPackage;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
module.exports = AdvertisementPackageRepository;
