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
    try {
      if (!this.categoryId) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Category ID is required"
        );
      }
      await validMongooseObjectId(this.categoryId);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UpdateCategoryDto;
