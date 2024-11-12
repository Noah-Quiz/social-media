const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateCategoryDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The category's name.

 */
class UpdateCategoryDto {
  constructor(categoryId, name) {
    this.categoryId = categoryId;
    this.name = name;
  }

  async validate() {
    if (this.name === "") {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Name must not be an empty string"
      );
    }

    if (!this.categoryId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Category ID is required"
      );
    }
    try {
      await validMongooseObjectId(this.categoryId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid category ID"
      );
    }
  }
}

module.exports = UpdateCategoryDto;
