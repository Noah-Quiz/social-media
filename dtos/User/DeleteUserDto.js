const { default: mongoose } = require("mongoose");
const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

class DeleteUserDto {
  constructor(userId) {
    this.userId = userId;
  }
  async validate() {
    if (!userId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "user ID is required"
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.userId)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid user ID"
      );
    }
  }
}

module.exports = DeleteUserDto;
