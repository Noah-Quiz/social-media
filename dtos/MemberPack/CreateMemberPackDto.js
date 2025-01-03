const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { hasSpecialCharacters } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateMemberPackDto:
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
 *         isDeleted:
 *           type: boolean
 *           description: Soft delete status (default is false).
 */
class CreateMemberPackDto {
  constructor(
    name,
    description,
    price,
    durationUnit,
    durationNumber,
    isDeleted = false
  ) {
    this.name = name;
    this.description = description;
    this.price = price;
    this.durationUnit = durationUnit;
    this.durationNumber = durationNumber;
    this.isDeleted = isDeleted;
  }

  async validate() {
    const allowedDurationUnits = ["DAY", "MONTH", "YEAR"];

    if (
      !this.name ||
      typeof this.name !== "string" ||
      this.name.length < 1 ||
      this.name.length > 50 ||
      hasSpecialCharacters(this.name)
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid field: name must be a non-empty string with a length between 1 and 50 characters not containing special character."
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

    if (typeof this.isDeleted !== "boolean") {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid field: isDeleted must be a boolean."
      );
    }
  }
}

module.exports = CreateMemberPackDto;
