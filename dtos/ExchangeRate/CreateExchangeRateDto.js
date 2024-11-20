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
      "dailyPoint",
      "streakBonus",
      "ReceivePercentage",
    ];

    if (!this.name || !allowedNames.includes(this.name)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        `Invalid field: name must be one of ${allowedNames.join(", ")}.`
      );
    }

    if (
      typeof this.value !== "number" ||
      isNaN(this.value) ||
      this.value <= 0
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid field: value must be a valid positive number."
      );
    }
  }
}

module.exports = CreateExchangeRateDto;
