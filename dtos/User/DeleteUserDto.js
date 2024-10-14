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
    await validMongooseObjectId(this.userId);
  }
}

module.exports = DeleteUserDto;
