const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateStreamDto:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: The stream's title.
 *         description:
 *           type: string
 *           description: The stream's description.
 *         categoryIds:
 *           type: array
 *           items:
 *             type: string
 *           description: The added category IDs.
 *         streamThumbnail:
 *           type: string
 *           format: binary
 *           description: The thumbnail file for the stream.
 */
class UpdateStreamDto {
  constructor(streamId, userId, title, description, categoryIds) {
    this.streamId = streamId;
    this.userId = userId;
    this.title = title;
    this.description = description;
    this.categoryIds = categoryIds;
  }
  async validate() {
    if (!this.userId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User ID is required"
      );
    }
    await validMongooseObjectId(this.userId);
    if (!this.streamId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Stream ID is required"
      );
    }
    await validMongooseObjectId(this.streamId);
    if (!this.title) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Title is required"
      );
    }
    if (this.categoryIds && !Array.isArray(this.categoryIds)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Category IDs must be an array"
      );
    }
    if (this.categoryIds && this.categoryIds.length > 0) {
      this.categoryIds.forEach(async (id) => {
        if (id || id.length > 0) {
          await validMongooseObjectId(id);
        }
      });
    }
  }
}

module.exports = UpdateStreamDto;
