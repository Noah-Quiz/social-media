const { isFloat } = require("validator");
const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateGiftDto:
 *       type: object
 *       required:
 *         - name
 *         - valuePerUnit
 *         - giftCreateImg
 *       properties:
 *         name:
 *           type: string
 *           description: The gift's name.
 *         giftCreateImg:
 *           type: string
 *           format: binary
 *           description: The gift's image.
 *         valuePerUnit:
 *           type: number
 *           description: The value per unit of a gift.
 */
class CreateGiftDto {
  constructor(name, image, valuePerUnit) {
    this.name = name;
    this.image = image;
    this.valuePerUnit = valuePerUnit;
  }

  async validate() {
    if (!this.name) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Name is required"
      );
    }
    if (!this.image) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Image is required"
      );
    }
    if (this.valuePerUnit == null || isNaN(this.valuePerUnit)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Value per unit is required and must be a number"
      );
    }
    if (!isFloat(this.valuePerUnit?.toString(), { min: 0 })) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid price format"
      );
    }
  }
}

module.exports = CreateGiftDto;
