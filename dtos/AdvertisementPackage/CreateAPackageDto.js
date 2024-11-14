/**
 * @swagger
 * components:
 *   schemas:
 *     CreateAPackageDto:
 *       type: object
 *       required:
 *         - coin
 *         - dateUnit
 *         - numberOfDateUnit
 *       properties:
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

class CreateAPackageDto {
  constructor(coin, dateUnit, numberOfDateUnit) {
    this.coin = coin;
    this.dateUnit = dateUnit;
    this.numberOfDateUnit = numberOfDateUnit;
  }

  async validate() {
    const allowedDateUnits = ["DAY", "MONTH", "YEAR"];

    // Validate coin
    if (!this.coin) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Coin is required."
      );
    }
    if (isNaN(this.coin) || this.coin <= 0 || !Number.isInteger(this.coin)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid coin format: Coin must be a positive integer."
      );
    }

    // Validate dateUnit
    if (!allowedDateUnits.includes(this.dateUnit)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid date unit: Date unit must be one of DAY, MONTH, or YEAR."
      );
    }

    // Validate numberOfDateUnit
    if (!this.numberOfDateUnit) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Number of date units is required."
      );
    }
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

module.exports = CreateAPackageDto;
