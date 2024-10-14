const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetHistoryRecordsDto {
  constructor(userId, page, size) {
    this.userId = userId;
    this.page = page;
    this.size = size;
  }

  async validate() {
    if (!this.userId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User ID is required"
      );
    }
    await validMongooseObjectId(this.userId);

    if (this.page && this.page < 1) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Page is invalid"
      );
    }
    if (this.size && this.size < 1) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Size is invalid"
      );
    }
  }
}

module.exports = GetHistoryRecordsDto;
