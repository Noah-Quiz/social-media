const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const registerPremiumService = async (userId, packageId) => {
  const connection = new DatabaseTransaction();
  try {
    const user = await connection.vipRepository.upgradeSystemVipRepository(
      userId,
      packageId
    );
    if (!user || user.vip.status === false) {
      throw new CoreException(
        StatusCodeEnums.InternalServerError_500,
        "Fail to register premium"
      );
    }
  } catch (error) {
    throw error;
  }
};
module.exports = {
  registerPremiumService,
};
