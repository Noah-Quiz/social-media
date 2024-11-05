const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCommentDto:
 *       type: object
 *       required:
 *        - videoId
 *        - content
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
    // Validate userId
    if (!this.userId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Missing required userId field"
      );
    }
    try {
      await validMongooseObjectId(this.userId); // Validate as ObjectId
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid user ID"
      );
    }

    // Validate videoId
    if (!this.videoId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Missing required videoId field"
      );
    }
    try {
      await validMongooseObjectId(this.videoId); // Validate as ObjectId
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid video ID"
      );
    }

    // Validate content (no need to validate as ObjectId, just check if it exists)
    if (!this.content) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Missing required content field"
      );
    }
    // No ObjectId validation for content

    // Validate responseTo if provided (it's optional)
    if (this.responseTo) {
      try {
        await validMongooseObjectId(this.responseTo); // Only validate if provided
      } catch (error) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid user ID"
        );
      }
    }
  }
}

module.exports = CreateCommentDto;
