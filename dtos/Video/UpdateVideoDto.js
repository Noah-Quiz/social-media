const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateVideoDto:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - categoryIds
 *         - enumMode
 *         - thumbnailUrl
 *       properties:
 *         title:
 *           type: string
 *           default: example
 *           description: Video's title
 *         description:
 *           type: string
 *           default: example description
 *           description: Video's description
 *         categoryIds:
 *           type: array
 *           default: []
 *           description: A list of category IDs
 *         enumMode:
 *           type: string
 *           default: public
 *           description: Value of enum mode [public, private, unlisted]
 *         thumbnailUrl:
 *           type: string
 *           default: https://example.com
 *           description: URL of thumbnail
 */

class UpdateVideoDto {
  constructor(videoId, videoThumbnailFile) {
    this.videoId = videoId;
    this.videoThumbnailFile = videoThumbnailFile;
  }

  async validate() {
    if (!this.videoId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Video ID is required"
      );
    }
    await validMongooseObjectId(this.videoId);
    if (!this.videoThumbnailFile) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Video thumbnail file is required"
      );
    }
  }
}

module.exports = UpdateVideoDto;
