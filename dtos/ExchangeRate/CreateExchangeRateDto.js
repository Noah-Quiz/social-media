const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateExchangeRateDto:
 *       type: object
 *       required:
 *         - topUpBalanceRate
 *         - topUpCoinRate
 *         - exchangeRateBalanceToCoin
 *         - exchangeRateCoinToBalance 
 *         - coinPer1000View 
 *       properties:
 *         topUpBalanceRate:
 *           type: number
 *           description: The .
 *         topUpCoinRate:
 *           type: number
 *           description: The .
 *         exchangeRateBalanceToCoin:
 *           type: number
 *           description: The .
 *         exchangeRateCoinToBalance:
 *           type: number
 *           description: The .
 *         coinPer1000View:
 *           type: number
 *           description: The .   
 */
class CreateExchangeRateDto {
  constructor(
    topUpBalanceRate,
    topUpCoinRate,
    exchangeRateBalanceToCoin,
    exchangeRateCoinToBalance,
    coinPer1000View
  ) {
    this.topUpBalanceRate = topUpBalanceRate;
    this.topUpCoinRate = topUpCoinRate;
    this.exchangeRateBalanceToCoin = exchangeRateBalanceToCoin;
    this.exchangeRateCoinToBalance = exchangeRateCoinToBalance;
    this.coinPer1000View = coinPer1000View;
  }
  async validate() {
    if (
      this.topUpBalanceRate !== undefined &&
      (typeof this.topUpBalanceRate !== "number" ||
        isNaN(this.topUpBalanceRate))
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid field: topUpBalanceRate must be a valid number."
      );
    }
    if (
      this.topUpCoinRate !== undefined &&
      (typeof this.topUpCoinRate !== "number" || isNaN(this.topUpCoinRate))
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid field: topUpCoinRate must be a valid number."
      );
    }
    if (
      this.exchangeRateBalanceToCoin !== undefined &&
      (typeof this.exchangeRateBalanceToCoin !== "number" ||
        isNaN(this.exchangeRateBalanceToCoin))
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid field: exchangeRateBalanceToCoin must be a valid number."
      );
    }
    if (
      this.exchangeRateCoinToBalance !== undefined &&
      (typeof this.exchangeRateCoinToBalance !== "number" ||
        isNaN(this.exchangeRateCoinToBalance))
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid field: exchangeRateCoinToBalance must be a valid number."
      );
    }
    if (
      this.coinPer1000View !== undefined &&
      (typeof this.coinPer1000View !== "number" || isNaN(this.coinPer1000View))
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid field: coinPer1000View must be a valid number."
      );
    }
  }
}

module.exports = CreateExchangeRateDto;
