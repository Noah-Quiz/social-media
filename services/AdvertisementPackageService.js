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
      throw new Error(error.message);
    }
  },

  getAllAvailablePackageService: async () => {
    try {
      const packages =
        await connection.advertisementPackageRepository.getAllAvailablePackagesRepository();
      return packages;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateAPackageByIdService: async (id, coin, dateUnit, numberOfDateUnit) => {
    try {
      const package =
        await connection.advertisementPackageRepository.updateAPackageByIdRepository(
          id,
          coin,
          dateUnit,
          numberOfDateUnit
        );
      return package;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getAPackageByIdService: async (id) => {
    try {
      const package =
        await connection.advertisementPackageRepository.getAPackageByIdRepository(
          id
        );
      return package;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteAPackageByIdService: async (id) => {
    try {
      const package =
        await connection.advertisementPackageRepository.deleteAPackageByIdRepository(
          id
        );
      return package;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
