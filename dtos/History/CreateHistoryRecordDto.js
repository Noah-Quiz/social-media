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
  constructor( videoId) {
    this.videoId = videoId;
  }
  async validate() {
    if (!this.videoId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Video ID is required"
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
  }
}

module.exports = CreateHistoryRecordDto;
