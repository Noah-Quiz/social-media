const { default: mongoose } = require("mongoose");
const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

class GetUserWalletDto {
  constructor(userId) {
    this.userId = userId;
  }

  async validate() {
    if (!this.userId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User ID is required"
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.userId)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Valid user ID is required"
      );
    }
  }
}

module.exports = GetUserWalletDto;
