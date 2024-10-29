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
 *         addedCategoryIds:
 *           type: array
 *           items:
 *             type: string
 *           description: The added category IDs.
 *         removedCategoryIds:
 *           type: array
 *           items:
 *             type: string
 *           description: The removed category IDs.
 *         streamThumbnail:
 *           type: string
 *           format: binary
 *           description: The thumbnail file for the stream.
 */ 
class UpdateStreamDto {
  constructor(
    streamId,
    userId,
    title,
    description,
    addedCategoryIds,
    removedCategoryIds
  ) {
    this.streamId = streamId;
    this.userId = userId;
    this.title = title;
    this.description = description;
    this.addedCategoryIds = addedCategoryIds;
    this.removedCategoryIds = removedCategoryIds;
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
    if (this.addedCategoryIds && !Array.isArray(this.addedCategoryIds))
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "addedCategoryIds must be an array"
      );
    if (this.removedCategoryIds && !Array.isArray(this.removedCategoryIds))
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "removedCategoryIds must be an array"
      );
  }
}

module.exports = UpdateStreamDto;
