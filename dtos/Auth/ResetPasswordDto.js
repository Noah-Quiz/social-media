const { validPassword } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     ResetPasswordDto:
 *       type: object
 *       required:
 *         - newPassword
 *       properties:
 *         newPassword:
 *           type: string
 *           format: passsword
 *           description: The user's new password.
 */
class ResetPasswordDto {
  constructor(newPassword) {
    this.newPassword = newPassword;
  }

  async validate() {
    try {
      await validPassword(this.newPassword);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ResetPasswordDto;
