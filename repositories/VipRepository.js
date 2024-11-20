const { default: mongoose } = require("mongoose");
const VipPackage = require("../entities/VipPackageEntity");
const User = require("../entities/UserEntity");
const CoreException = require("../exceptions/CoreException");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
class VipClass {
  async upgradeSystemVip(userId, packageId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const vipPackage = await VipPackage.findOne({
        _id: new mongoose.Types.ObjectId(packageId),
        isDeleted: false,
      }).session(session);
      if (!vipPackage) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Package not found"
        );
      }
      const user = await User.findOne({
        _id: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      }).session(session);
      if (!user) {
        throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
      }
      if (user.wallet.coin < vipPackage.price) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Insufficient coin"
        );
      }
      user.wallet.coin -= vipPackage.price;

      let time = 0;
      switch (vipPackage.durationUnit) {
        case "DAY":
          time = 86400000 * vipPackage.durationNumber;
          break;
        case "MONTH":
          time = 86400000 * 30 * vipPackage.durationNumber;
          break;
        case "YEAR":
          time = 86400000 * 365 * vipPackage.durationNumber;
          break;
        default:
          throw new CoreException(
            StatusCodeEnums.BadRequest_400,
            "Invalid duration unit"
          );
      }

      if (user.vip.status === true) {
        //extend vip
        user.vip.endDate = new Date(user.vip.endDate.getTime() + time);
        user.vip.packageId = vipPackage._id;
      } else {
        //new vip
        user.vip.status = true;
        user.vip.joinDate = new Date();
        user.vip.endDate = new Date(Date.now() + time);
        user.vip.packageId = vipPackage._id;
      }

      await user.save({ session });
      await session.commitTransaction();
      await session.endSession();
      return user;
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw error;
    }
  }
}
module.exports = VipPackageClass;
