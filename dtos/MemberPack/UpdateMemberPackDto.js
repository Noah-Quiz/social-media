// File: dtos/MemberPack/UpdateMemberPackDto.js

const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { hasSpecialCharacters } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateMemberPackDto:
 *       type: object
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
 *           description: Soft delete status.
 */
class UpdateMemberPackDto {
  constructor({
    name,
    description,
    price,
    durationUnit,
    durationNumber,
    isDeleted,
  }) {
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
      this.name !== undefined &&
      (typeof this.name !== "string" ||
        this.name.length < 1 ||
        this.name.length > 50 ||
        hasSpecialCharacters(this.name))
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid field: name must be a string with a length between 1 and 50 characters not containing special character.."
      );
    }

    if (
      this.description !== undefined &&
      typeof this.description !== "string"
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid field: description must be a string."
      );
    }

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

module.exports = UpdateMemberPackDto;
