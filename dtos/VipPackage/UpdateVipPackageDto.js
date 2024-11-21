const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateVipPackageDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the VIP package.
 *         description:
 *           type: string
 *           description: Description of the VIP package.
 *         price:
 *           type: number
 *           description: The price of the VIP package.
 *         durationUnit:
 *           type: string
 *           enum: [DAY, MONTH, YEAR]
 *           description: Duration unit for the VIP package.
 *         durationNumber:
 *           type: integer
 *           description: Number of units for the duration.
 */
class UpdateVipPackageDto {
  constructor({ id, name, description, price, durationUnit, durationNumber }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.durationUnit = durationUnit;
    this.durationNumber = durationNumber;
  }

  async validate() {
    const allowedDurationUnits = ["DAY", "MONTH", "YEAR"];

    // Validate ID
    if (!this.id) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "VIP package ID is required"
      );
    }
    try {
      await validMongooseObjectId(this.id);
    } catch (error) {
      console.log(this.id);
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid VIP package ID"
      );
    }

    // Validate name
    if (
      this.name !== undefined &&
      (typeof this.name !== "string" ||
        this.name.length < 1 ||
        this.name.length > 100)
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid field: name must be a string with a length between 1 and 100 characters."
      );
    }

    // Validate description
    if (
      this.description !== undefined &&
      typeof this.description !== "string"
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid field: description must be a string."
      );
    }

    // Validate price
    if (
      this.price !== undefined &&
      (typeof this.price !== "number" ||
        isNaN(this.price) ||
        this.price <= 0 ||
        !Number.isInteger(this.price))
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid field: price must be a positive integer."
      );
    }

    // Validate durationUnit
    if (
      this.durationUnit !== undefined &&
      !allowedDurationUnits.includes(this.durationUnit)
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        `Invalid field: durationUnit must be one of ${allowedDurationUnits.join(
          ", "
        )}.`
      );
    }

    // Validate durationNumber
    if (
      this.durationNumber !== undefined &&
      (typeof this.durationNumber !== "number" ||
        this.durationNumber <= 0 ||
        !Number.isInteger(this.durationNumber))
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid field: durationNumber must be a positive integer."
      );
    }
  }
}

module.exports = UpdateVipPackageDto;
