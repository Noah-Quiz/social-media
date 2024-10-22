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
  constructor(userId, title, description, categoryIds) {
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
    if (this.categoryIds) {
      this.categoryIds.forEach(async (id) => {
        await validMongooseObjectId(id);
      });
    }
  }
}

module.exports = CreateStreamDto;
