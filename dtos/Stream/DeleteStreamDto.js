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
    try {
      await validMongooseObjectId(this.streamId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid stream ID"
      );
    }
    if (!this.userId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Valid user ID is required"
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

module.exports = DeleteStreamDto;
