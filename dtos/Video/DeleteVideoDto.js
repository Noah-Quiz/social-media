const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");
/**
 * @swagger
 * components:
 *   schemas:
 *     DeleteVideoDto:
 *       type: object
 *       required:
 *         - userId
 *         - videoId
 *       properties:
 *         userId:
 *           type: string
 *           default: 670621c0fe62bfae8a44d099
 *           description: ID of the user
 *         videoId:
 *           type: string
 *           default: example
 *           description: ID of the video
 */
class DeleteVideoDto {
  constructor(videoId, userId) {
    this.videoId = videoId;
    this.userId = userId;
  }

  async validate() {
    if (!this.videoId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Video ID is required"
      );
    }
    await validMongooseObjectId(this.videoId);
    if (!this.userId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User ID is required"
      );
    }
    await validMongooseObjectId(this.userId);
  }
}

module.exports = DeleteVideoDto;
