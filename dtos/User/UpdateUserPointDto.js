const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

class UpdateUserPointDto {
  constructor(amount, type) {
    this.amount = amount;
    this.type = type;
  }
  async validate() {
    try {
      if (!this.amount)
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Amount is required!"
        );
      if (!this.type)
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Type is required!"
        );

      if (
        isNaN(this.amount) ||
        this.amount < 0 ||
        !Number.isInteger(this.amount)
      ) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Amount must be a positive integer!"
        );
      }
      if (!["add", "remove", "exchange"].includes(this.type)) {
        throw new CoreException(StatusCodeEnums.BadRequest_400, "Invalid type");
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UpdateUserPointDto;
