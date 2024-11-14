const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { hasSpecialCharacters } = require("../../utils/validator");
/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCategoryDto:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The category's name. Must be a minimum of 2 characters and a maximum of 100 characters.
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

    if (hasSpecialCharacters(this.name)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Name cannot contain special characters"
      );
    }
  }
}

module.exports = CreateCategoryDto;
