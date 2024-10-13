const { default: mongoose } = require("mongoose");
const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validEmail } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserEmailDto:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email.
 */
class UpdateUserEmailDto {
  constructor(userId, email) {
    this.email = email;
  }
  async validate() {
    if (!this.userId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User ID is required"
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.userId)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Valid user ID is required"
      );
    }
    if (!this.email) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Email is required"
      );
    }
    await validEmail(this.email);
  }
}

module.exports = UpdateUserEmailDto;
