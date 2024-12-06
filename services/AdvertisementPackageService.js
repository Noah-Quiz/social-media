const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const mongoose = require("mongoose");
const connection = new DatabaseTransaction();
module.exports = {
  createAPackageService: async (coin, dateUnit, numberOfDateUnit) => {
    try {
      const advertisementPackage =
        await connection.advertisementPackageRepository.createAdvertisementPackageRepository(
          coin,
          dateUnit,
          numberOfDateUnit
        );
      return advertisementPackage;
    } catch (error) {
      throw error;
    }
  },

  getAllAvailablePackageService: async () => {
    try {
      const packages =
        await connection.advertisementPackageRepository.getAllAvailablePackagesRepository();
      if (!packages || packages?.length === 0) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "No packages available"
        );
      }
      return packages;
    } catch (error) {
      throw error;
    }
  },

  updateAPackageByIdService: async (id, coin, dateUnit, numberOfDateUnit) => {
    try {
      const checkPakage =
        await connection.advertisementPackageRepository.getAPackageByIdRepository(
          id
        );
      if (!checkPakage) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "No advertisement package found"
        );
      }
      const package =
        await connection.advertisementPackageRepository.updateAPackageByIdRepository(
          id,
          coin,
          dateUnit,
          numberOfDateUnit
        );
      return package;
    } catch (error) {
      throw error;
    }
  },

  getAPackageByIdService: async (id) => {
    try {
      const package =
        await connection.advertisementPackageRepository.getAPackageByIdRepository(
          id
        );
      if (!package) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "No advertisement package found"
        );
      }
      return package;
    } catch (error) {
      throw error;
    }
  },

  deleteAPackageByIdService: async (id) => {
    try {
      const checkPakage =
        await connection.advertisementPackageRepository.getAPackageByIdRepository(
          id
        );
      if (!checkPakage) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "No advertisement package found"
        );
      }
      const package =
        await connection.advertisementPackageRepository.deleteAPackageByIdRepository(
          id
        );
      return package;
    } catch (error) {
      throw error;
    }
  },
};
