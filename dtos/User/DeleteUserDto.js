const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class DeleteUserDto {
  constructor(userId) {
    this.userId = userId;
  }
  async validate() {
    if (!this.userId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "user ID is required"
      );
    }
    try {
      await validMongooseObjectId(this.userId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid user ID"
      );
    }
  }
}

module.exports = DeleteUserDto;
