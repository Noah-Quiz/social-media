const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     PayWithGooglePayDto:
 *       type: object
 *       required:
 *         - id
 *         - price
 *         - method
 *       properties:
 *         id:
 *            type: string
 *            description: The id of product.
 *         price:
 *            type: number
 *            description: The price of product.
 *         method:
 *            type: string
 *            description: The method of payment.
 */
class PayWithGooglePayDto {
  constructor(id, price, method) {
    this.id = id;
    this.price = price;
    this.method = method;
  }

  async validate() {
    if (!this.id) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "Id is required");
    }
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
    if (!this.method) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Method is required"
      );
    }
  }
}

module.exports = PayWithGooglePayDto;
