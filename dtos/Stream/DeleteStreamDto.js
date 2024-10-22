const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class DeleteStreamDto {
  constructor(streamId, userId) {
    this.streamId = streamId;
    this.userId = userId;
  }
  async validate() {
    if (!this.streamId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Valid stream ID is required"
      );
    }
    await validMongooseObjectId(this.streamId);
    if (!this.userId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Valid user ID is required"
      );
    }
    await validMongooseObjectId(this.userId);
  }
}

module.exports = DeleteStreamDto;
