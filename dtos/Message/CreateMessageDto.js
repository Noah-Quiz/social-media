const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateMessageDto:
 *       type: object
 *       required:
 *        - roomId
 *       properties:
 *         roomId:
 *           type: string
 *           description: The room's id.
 *         content:
 *           type: string
 *           description: The message content.
 */
class CreateMessageDto {
  constructor(userId, roomId, content) {
    this.userId = userId;
    this.roomId = roomId;
    this.content = content;
  }

  async validate() {
    if (!this.userId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User ID is required"
      );
    }
    await validMongooseObjectId(this.userId);
    if (!this.roomId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Room ID is required"
      );
    }
    await validMongooseObjectId(this.roomId);
  }
}

module.exports = CreateMessageDto;
