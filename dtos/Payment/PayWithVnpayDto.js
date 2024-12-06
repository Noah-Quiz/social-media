const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class PayWithVnpayDto {
  constructor(price) {
    this.price = price;
  }

  async validate() {
    if (!this.price) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Price is required"
      );
    }
    if (
      this.price &&
      (isNaN(this.price) || !(this.price >= 5000 && this.price <= 1000000000))
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Price must be greater than 5.000vnd and less than 1.000.000.000vnd"
      );
    }
  }
}

module.exports = PayWithVnpayDto;
