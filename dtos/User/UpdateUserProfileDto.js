const { default: mongoose } = require("mongoose");
const { validFullName } = require("../../utils/validator");
const CoreException = require("../../exceptions/CoreException");
const StatusCodeEnums = require("../../enums/StatusCodeEnum");

class UpdateUserProfileDto {
  constructor(userId, fullName, nickName) {
    this.userId = userId;
    this.fullName = fullName;
    this.nickName = nickName;
  }
  async validate() {
    try {
      await validFullName(this.fullName);
      if (!mongoose.Types.ObjectId.isValid(this.userId)) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid user ID"
        );
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UpdateUserProfileDto;
