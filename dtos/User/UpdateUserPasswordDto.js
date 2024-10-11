const { default: mongoose } = require("mongoose");
const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validPassword } = require("../../utils/validator");

class UpdateUserPasswordDto {
  constructor(userId, oldPassword, newPassword) {
    this.userId = userId;
    this.oldPassword = oldPassword;
    this.newPassword = newPassword;
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
    if (!this.oldPassword || !this.newPassword) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Old and new password are required"
      );
    }
    if (this.oldPassword === this.newPassword) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Old and new password must be different"
      );
    }
    await validPassword(this.newPassword);
    await validPassword(this.oldPassword);
  }
}

module.exports = UpdateUserPasswordDto;
