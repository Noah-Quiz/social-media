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
 *         - name
 *         - price
 *       properties:
 *         name:
 *            type: string
 *            description: The name of product.
 *         price:
 *            type: number
 *            description: The price of product.
 */
class PayWithPaypalDto {
  constructor(userId, name, price) {
    this.userId = userId;
    this.name = name;
    this.price = price;
  }

  async validate() {
    if (!this.userId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User ID is required"
      );
    }
    try {
      await validMongooseObjectId(this.userId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid User ID"
      );
    }
    if (!this.name) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Name is required"
      );
    }
    if (!this.price) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Price is required"
      );
    }
  }
}

module.exports = PayWithPaypalDto;
