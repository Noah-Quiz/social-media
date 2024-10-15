const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCommentDto:
 *       type: object
 *       properties:
 *         videoId:
 *           type: string
 *           description: The video's id.
 *         content:
 *           type: string
 *           description: The comment's content.
 *         responseTo:
 *           type: string
 *           description: The previous comment's id.
 */
class CreateCommentDto {
  constructor(userId, videoId, content, responseTo) {
    this.userId = userId;
    this.videoId = videoId;
    this.content = content;
    this.responseTo = responseTo;
  }

  async validate() {
    if (!this.userId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Missing required userId field"
      );
    }
    await validMongooseObjectId(this.userId);
    if (!this.videoId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Missing required videoId field"
      );
    }
    await validMongooseObjectId(this.videoId);
    if (!this.content) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Missing required content field"
      );
    }
    await validMongooseObjectId(this.content);
    if (!this.responseTo) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Missing required responseTo field"
      );
    }
    await validMongooseObjectId(this.responseTo);
  }
}

module.exports = CreateCommentDto;
