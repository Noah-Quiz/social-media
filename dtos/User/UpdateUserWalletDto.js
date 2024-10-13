const { default: mongoose } = require("mongoose");
const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserWalletDto:
 *       type: object
 *       required:
 *         - amount
 *         - actionCurrencyType
 *       properties:
 *         amount:
 *           type: number
 *           description: The user's wallet balance.
 *           example: 1000
 *         actionCurrencyType:
 *           type: string
 *           description: Type of update currency ["SpendBalance", "SpendCoin", "ExchangeBalanceToCoin"].
 *           enum: ["SpendBalance", "SpendCoin", "ExchangeBalanceToCoin"]
 *           example: SpendBalance
 *         exchangeRate:
 *           type: number
 *           description: The exchange rate.
 */
class UpdateUserWalletDto {
  constructor(userId, amount, actionCurrencyType, exchangeRate) {
    this.userId = userId;
    this.amount = amount;
    this.actionCurrencyType = actionCurrencyType;
    this.exchangeRate = exchangeRate;
  }
  async validate() {
    if (!this.userId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Missing field: userId"
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.userId)) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "Invalid userId");
    }
    if (!this.amount) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Missing field: amount"
      );
    }
    if (!this.actionCurrencyType) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Missing field: actionCurrencyType"
      );
    }
  }
}

module.exports = UpdateUserWalletDto;
