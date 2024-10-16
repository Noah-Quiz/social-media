const { isFloat } = require("validator");
const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateGiftDto:
 *       type: object
 *       required:
 *         - name
 *         - image
 *         - valuePerUnit
 *       properties:
 *         name:
 *           type: string
 *           description: The gift's name.
 *         image:
 *           type: string
 *           description: The gift's image.
 *         valuePerUnit:
 *           type: string
 *           description: The value per unit of a gift.
 */
class UpdateGiftDto {
  constructor(id, name, image, valuePerUnit) {
    this.id;
    this.name = name;
    this.image = image;
    this.valuePerUnit = valuePerUnit;
  }

  async validate() {
    if (!this.id) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "ID is required");
    }
    await validMongooseObjectId(this.id);
    if (!isFloat(this.valuePerUnit.toString())) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid price format"
      );
    }
  }
}

module.exports = UpdateGiftDto;
