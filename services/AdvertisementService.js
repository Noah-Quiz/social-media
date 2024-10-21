const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const mongoose = require("mongoose");

module.exports = {
  async createAnAdvertisementService(userId, videoId, packageId) {
    try {
      const connection = new DatabaseTransaction();
      const advertisement =
        await connection.advertisementRepository.createAnAdvertisementRepository(
          userId,
          videoId,
          packageId
        );
      return advertisement;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getAllAvailableAdvertisementsService() {
    try {
      const connection = new DatabaseTransaction();
      const advertisements =
        await connection.advertisementRepository.getAllAvailableAdvertisementsRepository();
      return advertisements;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async updateAnAdvertisementByIdService(adsId, coin, expDate) {
    try {
      const connection = new DatabaseTransaction();
      const advertisement =
        await connection.advertisementRepository.updateAnAdvertisementByIdRepository(
          adsId,
          coin,
          expDate
        );
      return advertisement;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getAnAdvertisementByIdService(adsId) {
    try {
      const connection = new DatabaseTransaction();
      const advertisement =
        await connection.advertisementRepository.getAnAdvertisementByIdRepository(
          adsId
        );
      return advertisement;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async deleteAnAdvertisementByIdService(adsId) {
    try {
      const connection = new DatabaseTransaction();
      const advertisement =
        await connection.advertisementRepository.deleteAnAdvertisementByIdRepository(
          adsId
        );
      return advertisement;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
