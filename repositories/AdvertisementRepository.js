const { default: mongoose } = require("mongoose");
const Advertisement = require("../entities/Advertisement");
const AdvertisementPackage = require("../entities/AdvertisementPackage");

class AdvertisementRepository {
  async createAnAdvertisementRepository(userId, videoId, packageId) {
    try {
      const advertisementPackage = await AdvertisementPackage.findById(
        packageId
      );
      const dateUnit = advertisementPackage.dateUnit;
      const numberOfDateUnit = advertisementPackage.numberOfDateUnit;
      const expDate = new Date();

      if (dateUnit === "DAY") {
        expDate.setDate(expDate.getDate() + numberOfDateUnit);
      } else if (dateUnit === "MONTH") {
        expDate.setMonth(expDate.getMonth() + numberOfDateUnit);
      } else {
        expDate.setFullYear(expDate.getFullYear() + numberOfDateUnit);
      }

      const advertisement = await Advertisement.create({
        userId,
        videoId,
        advertisementPackage: new mongoose.Types.ObjectId(packageId),
        expDate,
      });
      return advertisement;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllAvailableAdvertisementsRepository() {
    try {
      const advertisements = await Advertisement.find({
        isAdvertised: true,
      }).sort("-coin");
      return advertisements;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateAnAdvertisementByIdRepository(adsId, coin, expDate) {
    try {
      const advertisement = await Advertisement.findByIdAndUpdate(
        {
          _id: adsId,
        },
        {
          coin,
          expDate,
        },
        {
          new: true,
        }
      );
      return advertisement;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAnAdvertisementByIdRepository(adsId) {
    try {
      const advertisement = await Advertisement.findById(adsId);
      return advertisement;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteAnAdvertisementByIdRepository(adsId) {
    try {
      const advertisement = await Advertisement.findByIdAndUpdate(
        adsId,
        {
          isDeleted: true,
          isAdvertised: false,
        },
        { new: true }
      );
      return advertisement;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = AdvertisementRepository;
