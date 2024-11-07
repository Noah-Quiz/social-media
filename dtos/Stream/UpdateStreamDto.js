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
 *         - description
 *         - categoryIds
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
 *           description: The array of category ID. If devs don't want to update, the same categoryIds array still need to include their existing categories. If array is empty, the stream categories will be empty.
 *         streamThumbnail:
 *           type: string
 *           format: binary
 *           description: The thumbnail file for the stream.
 */
class UpdateStreamDto {
  constructor(streamId, title, description, categoryIds) {
    this.streamId = streamId;
    this.title = title;
    this.description = description;
    this.categoryIds = categoryIds;
  }
  async validate() {
    if (!this.streamId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Stream ID is required"
      );
    }
    try {
      await validMongooseObjectId(this.streamId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid Stream ID"
      );
    }
    if (!this.title) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Title is required"
      );
    }
    if (this.categoryIds !== null && !Array.isArray(this.categoryIds)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Category IDs must be an array"
      );
    }
    if (this.categoryIds && this.categoryIds.length > 0) {
      await Promise.all(
        this.categoryIds.map(async (id) => {
          if (id || id.length > 0 || id === "") {
            try {
              await validMongooseObjectId(id);
            } catch (error) {
              throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "Invalid Category ID"
              );
            }
          }
        })
      );
    }
  }
}

module.exports = UpdateStreamDto;
