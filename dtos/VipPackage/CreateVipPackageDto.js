const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateVipPackageDto:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - durationUnit
 *         - durationNumber
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the member package.
 *         description:
 *           type: string
 *           description: Description of the member package.
 *         price:
 *           type: number
 *           description: The price of the member package.
 *         durationUnit:
 *           type: string
 *           enum: [DAY, MONTH, YEAR]
 *           description: Duration unit for the member package.
 *         durationNumber:
 *           type: integer
 *           description: Number of units for the duration.
 */
class CreateVipPackageDto {
  constructor(name, description, price, durationUnit, durationNumber) {
    this.name = name;
    this.description = description;
    this.price = price;
    this.durationUnit = durationUnit;
    this.durationNumber = durationNumber;
  }

  async validate() {
    const allowedDurationUnits = ["DAY", "MONTH", "YEAR"];

    if (
      !this.name ||
      typeof this.name !== "string" ||
      this.name.length < 1 ||
      this.name.length > 100
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid field: name must be a non-empty string with a length between 1 and 100 characters."
      );
    }

    if (!this.description || typeof this.description !== "string") {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid field: description must be a non-empty string."
      );
    }

    if (
      typeof this.price !== "number" ||
      isNaN(this.price) ||
      this.price <= 0 ||
      !Number.isInteger(this.price)
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid field: price must be a positive integer."
      );
    }

    if (!allowedDurationUnits.includes(this.durationUnit)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        `Invalid field: durationUnit must be one of ${allowedDurationUnits.join(
          ", "
        )}.`
      );
    }

    if (
      typeof this.durationNumber !== "number" ||
      this.durationNumber <= 0 ||
      !Number.isInteger(this.durationNumber)
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid field: durationNumber must be a positive integer."
      );
    }
  }
}

module.exports = CreateVipPackageDto;
