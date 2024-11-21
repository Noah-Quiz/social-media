const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const mongoose = require("mongoose");

module.exports = {
  async createAnAdvertisementService(userId, videoId, packageId) {
    try {
      const connection = new DatabaseTransaction();
      const checkPackage =
        await connection.advertisementPackageRepository.getAPackageByIdRepository(
          packageId
        );
      if (!checkPackage) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Advertisement package not found"
        );
      }
      const advertisement =
        await connection.advertisementRepository.createAnAdvertisementRepository(
          userId,
          videoId,
          packageId
        );
      return advertisement;
    } catch (error) {
      throw error;
    }
  },

  async extendAdvertisementService(adsId, packageId) {
    try {
      const connection = new DatabaseTransaction();
      const checkAd =
        await connection.advertisementRepository.getAnAdvertisementByIdRepository(
          adsId
        );
      if (!checkAd) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Advertisement not found"
        );
      }
      const checkPackage =
        await connection.advertisementPackageRepository.getAPackageByIdRepository(
          packageId
        );
      if (!checkPackage) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Advertisement package not found"
        );
      }
      const advertisement =
        await connection.advertisementRepository.extendAdvertisementRepository(
          adsId,
          packageId
        );
      return advertisement;
    } catch (error) {
      throw error;
    }
  },

  async getAllAvailableAdvertisementsService() {
    try {
      const connection = new DatabaseTransaction();
      const advertisements =
        await connection.advertisementRepository.getAllAvailableAdvertisementsRepository();
      if (!advertisements) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "No advertisement found"
        );
      }
      return advertisements;
    } catch (error) {
      throw error;
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
      throw error;
    }
  },

  async getAnAdvertisementByIdService(adsId) {
    try {
      const connection = new DatabaseTransaction();
      const advertisement =
        await connection.advertisementRepository.getAnAdvertisementByIdRepository(
          adsId
        );
      if (!advertisement) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Advertisement not found"
        );
      }
      return advertisement;
    } catch (error) {
      throw error;
    }
  },

  async deleteAnAdvertisementByIdService(adsId) {
    try {
      const connection = new DatabaseTransaction();
      const checkAdvertisement =
        await connection.advertisementRepository.getAnAdvertisementByIdRepository(
          adsId
        );
      if (!checkAdvertisement) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Advertisement not found"
        );
      }
      const advertisement =
        await connection.advertisementRepository.deleteAnAdvertisementByIdRepository(
          adsId
        );
      return advertisement;
    } catch (error) {
      throw error;
    }
  },
};
