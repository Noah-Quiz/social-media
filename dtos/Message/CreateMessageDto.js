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
 *           description: The message content. Must be a minimum of 1 characters and a maximum of 200 characters.
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
    try {
      await validMongooseObjectId(this.userId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid User ID"
      );
    }
    if (!this.roomId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Room ID is required"
      );
    }
    try {
      await validMongooseObjectId(this.roomId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid Room ID"
      );
    }
  }
}

module.exports = CreateMessageDto;
