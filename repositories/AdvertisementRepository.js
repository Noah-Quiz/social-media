const Advertisement = require("../entities/Advertisement");

class AdvertisementRepository {
  async createAnAdvertisementRepository(userId, videoId, coin, expDate) {
    try {
      const advertisement = await Advertisement.create({
        userId,
        videoId,
        coin,
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
