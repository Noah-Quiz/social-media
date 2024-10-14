const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const {
  validPassword,
  validMongooseObjectId,
} = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserPasswordDto:
 *       type: object
 *       required:
 *        - oldPassword
 *        - newPassword
 *       properties:
 *         oldPassword:
 *           type: string
 *           format: password
 *           description: The user's old password.
 *         newPassword:
 *           type: string
 *           format: password
 *           description: The user's new password.
 */
class UpdateUserPasswordDto {
  constructor(userId, oldPassword, newPassword) {
    this.userId = userId;
    this.oldPassword = oldPassword;
    this.newPassword = newPassword;
  }
  async validate() {
    if (!this.userId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User ID is required"
      );
    }
    await validMongooseObjectId(this.userId);

    if (!this.oldPassword || !this.newPassword) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Old and new password are required"
      );
    }
    if (this.oldPassword === this.newPassword) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Old and new password must be different"
      );
    }
    await validPassword(this.newPassword);
    await validPassword(this.oldPassword);
  }
}

module.exports = UpdateUserPasswordDto;
