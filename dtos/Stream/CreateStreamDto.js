const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateStreamDto:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *            type: string
 *            description: The stream's title.
 *         description:
 *            type: string
 *            description: The stream's description. 
 *         categoryIds:
 *           type: array
 *           items:
 *            type: string
 *           description: The category ids.
 */
class CreateStreamDto {
  constructor(title, description, categoryIds) {
    this.title = title;
    this.description = description;
    this.categoryIds = categoryIds;
  }

  async validate() {
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
      await Promise.all(
        this.categoryIds.map(async (id) => {
          if (id || id.length > 0) {
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

module.exports = CreateStreamDto;
