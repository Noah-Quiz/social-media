const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class DeleteMessageDto {
  constructor(messageId, userId) {
    this.messageId = messageId;
    this.userId = userId;
  }

  async validate() {
    if (!this.messageId)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Message ID is required"
      );
    try {
      await validMongooseObjectId(this.messageId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid Message ID"
      );
    }
    if (!this.userId)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User ID is required"
      );
    try {
      await validMongooseObjectId(this.userId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid User ID"
      );
    }
  }
}

module.exports = DeleteMessageDto;
