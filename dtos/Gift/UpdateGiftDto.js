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
    this.id = id;
    this.name = name;
    this.image = image;
    this.valuePerUnit = valuePerUnit;
  }

  async validate() {
    if (!this.id) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "ID is required");
    }
    try {
      await validMongooseObjectId(this.id);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid gift ID"
      );
    }
    let count = 0;
    if (!this.name || this.name === "" || this.name === null) {
      count++;
    }
    if (!this.image || this.image === "" || this.image === null) {
      count++;
    }
    if (
      !this.valuePerUnit ||
      this.valuePerUnit === "" ||
      this.valuePerUnit === null ||
      count <= 0
    ) {
      count++;
    }
    if (count === 3) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "At least 1 field in name, image, valuePerUnit  is required to update"
      );
    }
    if (this.name && (this.name.length < 1 || this.name.length > 50)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Name must be between 1 and 50 characters."
      );
    }

    if (!this.valuePerUnit) {
    } else if (!isFloat(this.valuePerUnit?.toString())) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid price format"
      );
    }
  }
}

module.exports = UpdateGiftDto;
