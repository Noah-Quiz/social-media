const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetMessageDto {
  constructor(messageId) {
    this.messageId = messageId;
  }

  async validate() {
    if (!this.messageId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Message ID is required"
      );
    }
    await validMongooseObjectId(this.messageId);
  }
}

module.exports = GetMessageDto;
