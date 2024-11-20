const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");

const createVipPackageService = async (
  name,
  description,
  price,
  durationUnit,
  durationNumber
) => {
  const connection = new DatabaseTransaction();
  try {
    const checkVipPackage =
      await connection.vipPackageRepository.getVipPackageByName(name);
    if (checkVipPackage) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Vip package with this name already exists"
      );
    }

    const vipPackage =
      await connection.vipPackageRepository.createVipPackageRepository({
        name,
        description,
        price,
        durationUnit,
        durationNumber,
      });
    return vipPackage;
  } catch (error) {
    throw error;
  }
};
const getVipPackageService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const vipPackage =
      await connection.vipPackageRepository.getVipPackageRepository(id);
    if (!vipPackage) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Vip Package not found"
      );
    }
    return vipPackage;
  } catch (error) {
    throw error;
  }
};
const getAllVipPackageService = async () => {
  const connection = new DatabaseTransaction();
  try {
    const vipPackages =
      await connection.vipPackageRepository.getAllVipPackageRepository();
    if (!vipPackages || vipPackages.length === 0) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "No vip package found"
      );
    }
    return vipPackages;
  } catch (error) {
    throw error;
  }
};
const updateVipPackageService = async (
  id,
  name,
  description,
  price,
  durationUnit,
  durationNumber
) => {
  const connection = new DatabaseTransaction();
  try {
    const checkVipPackage =
      await connection.vipPackageRepository.getVipPackageRepository(id);
    if (!checkVipPackage) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Vip Package not found"
      );
    }
    const checkVipPackage2 =
      await connection.vipPackageRepository.getVipPackageByName(name);
    if (checkVipPackage2) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Vip package with this name already exists"
      );
    }
    const vipPackage =
      await connection.vipPackageRepository.updateVipPackageRepository(
        id,
        name,
        description,
        price,
        durationUnit,
        durationNumber
      );
    return vipPackage;
  } catch (error) {
    throw error;
  }
};
const deleteVipPackageService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const checkVipPackage =
      await connection.vipPackageRepository.getVipPackageRepository(id);
    if (!checkVipPackage) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Vip Package not found"
      );
    }
    const vipPackage =
      await connection.vipPackageRepository.deleteVipPackageRepository(id);
    if (vipPackage.isDeleted === false) {
      throw new CoreException(
        StatusCodeEnums.InternalServerError_500,
        "Fail to delete vip package"
      );
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createVipPackageService,
  updateVipPackageService,
  getAllVipPackageService,
  getVipPackageService,
  deleteVipPackageService,
};
