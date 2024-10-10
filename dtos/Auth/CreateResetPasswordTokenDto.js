const { validEmail } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateResetPasswordTokenDto:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address.
 */
class CreateResetPasswordTokenDto {
  constructor(email) {
    this.email = email;
  }

  async validate() {
    try {
      await validEmail(this.email);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CreateResetPasswordTokenDto;
