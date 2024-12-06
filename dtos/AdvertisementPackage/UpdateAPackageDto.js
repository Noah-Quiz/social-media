/**
 * @swagger
 * components:
 *   schemas:
 *     UpdatePackageDto:
 *       type: object
 *       required:
 *         - coin
 *         - dateUnit
 *         - numberOfDateUnit
 *       properties:
 *         id:
 *          type: string
 *          default: 6715d3076bf9bc86307f184a
 *          description: ID of package
 *         coin:
 *           type: number
 *           default: 5000
 *           description: Coin need for this package
 *         dateUnit:
 *           type: string
 *           default: MONTH
 *           description: DAY, MONTH, YEAR
 *         numberOfDateUnit:
 *           type: number
 *           default: 1
 *           description: 1 year, 2 month
 */

const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class UpdateAPackageDto {
  constructor(id, coin, dateUnit, numberOfDateUnit) {
    this.id = id;
    this.coin = coin;
    this.dateUnit = dateUnit;
    this.numberOfDateUnit = numberOfDateUnit;
  }

  async validate() {
    const allowedDateUnits = ["DAY", "MONTH", "YEAR"];

    // Validate id (required)
    if (!this.id) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "ID is required."
      );
    }
    try {
      await validMongooseObjectId(this.id);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid package ID: ID must be a valid MongoDB ObjectId."
      );
    }

    // Validate coin if provided (optional)
    if (this.coin !== undefined && this.coin !== null) {
      if (isNaN(this.coin) || this.coin <= 0 || !Number.isInteger(this.coin)) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid coin format: Coin must be a positive integer."
        );
      }
    }

    // Validate dateUnit if provided (optional)
    if (this.dateUnit !== undefined && this.dateUnit !== null) {
      if (!allowedDateUnits.includes(this.dateUnit)) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid date unit: Date unit must be one of DAY, MONTH, or YEAR."
        );
      }
    }

    // Validate numberOfDateUnit if provided (optional)
    if (this.numberOfDateUnit !== undefined && this.numberOfDateUnit !== null) {
      if (
        isNaN(this.numberOfDateUnit) ||
        this.numberOfDateUnit <= 0 ||
        !Number.isInteger(this.numberOfDateUnit)
      ) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid format: Number of date units must be a positive integer."
        );
      }
    }
  }
}

module.exports = UpdateAPackageDto;
