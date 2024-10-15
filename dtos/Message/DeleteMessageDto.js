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
    await validMongooseObjectId(this.messageId);
    if (!this.userId)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User ID is required"
      );
    await validMongooseObjectId(this.userId);
  }
}

module.exports = DeleteMessageDto;
