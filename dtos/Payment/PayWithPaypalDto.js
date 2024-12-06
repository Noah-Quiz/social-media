const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     PayWithPaypalDto:
 *       type: object
 *       required:
 *         - price
 *       properties:
 *         price:
 *            type: number
 *            description: The price of product.
 */
class PayWithPaypalDto {
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
    if (this.price && (isNaN(this.price) || this.price <= 0)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Price must be a positive number"
      );
    }
  }
}

module.exports = PayWithPaypalDto;
