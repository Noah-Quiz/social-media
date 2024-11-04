const { default: mongoose } = require("mongoose");
const Advertisement = require("../entities/Advertisement");
const AdvertisementPackage = require("../entities/AdvertisementPackage");
const cron = require("node-cron");
const User = require("../entities/UserEntity");

cron.schedule("* * * * *", async () => {
  const advertisements = await Advertisement.find({
    expDate: { $lt: Date.now() },
    isAdvertised: true,
  });
  advertisements.forEach(async (ads) => {
    const extendPackage =
      ads.advertisementPackages[ads.currentPackageIndex + 1];
    if (extendPackage) {
      const newPackage = await AdvertisementPackage.findOne({
        _id: extendPackage,
      });
      const dateUnit = newPackage.dateUnit;
      const numberOfDateUnit = newPackage.numberOfDateUnit;
      const newExpDate = ads.expDate;
      if (dateUnit === "DAY") {
        newExpDate.setDate(newExpDate.getDate() + numberOfDateUnit);
      } else if (dateUnit === "MONTH") {
        newExpDate.setMonth(newExpDate.getMonth() + numberOfDateUnit);
      } else {
        newExpDate.setFullYear(newExpDate.getFullYear() + numberOfDateUnit);
      }
      const result = await Advertisement.updateOne(
        { _id: ads._id },
        {
          expDate: newExpDate,
          $inc: { currentPackageIndex: 1 },
          rank: newPackage.coin,
        }
      );
    } else {
      await Advertisement.updateOne({ _id: ads._id }, { isAdvertised: false });
    }
  });
});
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
      const user = await User.findById(userId);
      if (user.wallet.coin < advertisementPackage.coin) {
        throw new Error("Your coin is not enough");
      }

      user.wallet.coin -= advertisementPackage.coin;
      await user.save();
      const advertisement = await Advertisement.create({
        userId,
        videoId,
        totalCoin: advertisementPackage.coin,
        advertisementPackages: new mongoose.Types.ObjectId(packageId),
        expDate,
        rank: advertisementPackage.coin,
      });
      return advertisement;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async extendAdvertisementRepository(adsId, packageId) {
    try {
      const adsPackage = await AdvertisementPackage.findById(packageId);
      const advertisement = await Advertisement.findByIdAndUpdate(
        adsId,
        {
          $push: { advertisementPackages: adsPackage._id },
          $inc: { totalCoin: adsPackage.coin },
        },
        { new: true }
      );
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
