const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateMessageDto:
 *       type: object
 *       required:
 *        - content
 *       properties:
 *         content:
 *           type: string
 *           description: The message content.
 */
class UpdateMessageDto {
  constructor(messageId, content, userId) {
    this.messageId = messageId;
    this.content = content;
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
    if (!this.content)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Content is required"
      );
  }
}

module.exports = UpdateMessageDto;
