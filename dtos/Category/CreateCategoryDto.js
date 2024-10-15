const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCategoryDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The category's name.
 */
class CreateCategoryDto {
  constructor(name) {
    this.name = name;
  }
  async validate() {
    if (!this.name) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Name is required"
      );
    }
  }
}

module.exports = CreateCategoryDto;
