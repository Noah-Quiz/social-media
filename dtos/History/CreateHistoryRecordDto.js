const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateHistoryRecordDto:
 *       type: object
 *       required:
 *        - videoId
 *       properties:
 *         videoId:
 *           type: string
 *           description: The video's id.
 */
class CreateHistoryRecordDto {
  constructor(userId, videoId) {
    this.userId = userId;
    this.videoId = videoId;
  }
  async validate() {
    if (!this.userId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User ID is required"
      );
    }
    await validMongooseObjectId(this.userId);

    if (!this.videoId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Video ID is required"
      );
    }
    await validMongooseObjectId(this.videoId);
  }
}

module.exports = CreateHistoryRecordDto;
