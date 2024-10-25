const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateExchangeRateDto:
 *       type: object
 *       required:
 *         - name
 *         - value
 *       properties:
 *         name:
 *           type: string
 *           enum:
 *             - topUpBalanceRate
 *             - topUpCoinRate
 *             - exchangeRateBalanceToCoin
 *             - exchangeRateCoinToBalance
 *             - coinPer1000View
 *             - pointToCoin
 *           description: The specific type of exchange rate.
 *         value:
 *           type: number
 *           description: The value for the exchange rate.
 *         description:
 *           type: string
 *           description: An optional description.
 */
class CreateExchangeRateDto {
  constructor(name, value, description) {
    this.name = name;
    this.value = value;
    this.description = description;
  }

  async validate() {
    const allowedNames = [
      "topUpBalanceRate",
      "topUpCoinRate",
      "exchangeRateBalanceToCoin",
      "exchangeRateCoinToBalance",
      "coinPer1000View",
      "pointToCoin",
    ];

    if (!this.name || !allowedNames.includes(this.name)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        `Invalid field: name must be one of ${allowedNames.join(", ")}.`
      );
    }

    if (typeof this.value !== "number" || isNaN(this.value)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid field: value must be a valid number."
      );
    }
  }
}

module.exports = CreateExchangeRateDto;
