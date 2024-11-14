const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");
const { contentModeration } = require("../../utils/validator");
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
 *           description: The comment's content. Must be a minimum of 1 characters and a maximum of 2000 characters.
 *         responseTo:
 *           type: string
 *           description: The previous comment's id.
 */
class CreateCommentDto {
  constructor(videoId, content, responseTo) {
    this.videoId = videoId;
    this.content = content;
    this.responseTo = responseTo;
  }

  async validate() {
    // Validate videoId
    if (!this.videoId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Video ID required"
      );
    }
    try {
      await validMongooseObjectId(this.videoId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid Video ID"
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
    if (
      this.responseTo !== undefined &&
      this.responseTo !== null &&
      this.responseTo !== ""
    ) {
      try {
        await validMongooseObjectId(this.responseTo); // Only validate if provided
      } catch (error) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid responseTo user ID"
        );
      }
    }

    contentModeration(this.content, "comment");
  }
}

module.exports = CreateCommentDto;
