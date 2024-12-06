const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateExchangeRateDto:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - value
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the exchange rate.
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
 *           description: The updated value for the exchange rate.
 *         description:
 *           type: string
 *           description: An optional updated description.
 */
class UpdateExchangeRateDto {
  constructor(id, name, value, description) {
    this.id = id;
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

    if (!this.id && (!this.name || !allowedNames.includes(this.name))) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        `Invalid field: name must be one of ${allowedNames.join(", ")}.`
      );
    }
    if (!this.value && !this.description) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        `Invalid field: value or description need to be provided to perform update.`
      );
    }

    if (
      this.value &&
      (typeof this.value !== "number" || isNaN(this.value) || this.value <= 0)
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid field: value must be a valid positive number."
      );
    }
  }
}

module.exports = UpdateExchangeRateDto;
