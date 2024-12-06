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
 *            description: The stream's title. Must be a minimum of 2 characters and a maximum of 100 characters.
 *         description:
 *            type: string
 *            description: The stream's description. Must be a minimum of 1 characters and a maximum of 2000 characters.
 *         categoryIds:
 *           type: array
 *           items:
 *            type: string
 *            example: 671a01672a386fca99c73c02
 *           description: The array of category ID (optional)
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

module.exports = CreateStreamDto;
