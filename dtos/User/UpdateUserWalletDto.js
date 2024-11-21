const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

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
 *           description: Type of update currency ["SpendBalance", "SpendCoin", "ExchangeBalanceToCoin","ExchangeCoinToBalance"].
 *           enum: ["SpendBalance", "SpendCoin", "ExchangeBalanceToCoin","ExchangeCoinToBalance"]
 *           example: SpendBalance
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
    try {
      await validMongooseObjectId(this.userId);
    } catch (error) {
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
