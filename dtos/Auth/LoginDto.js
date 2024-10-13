const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validEmail } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginDto:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address.
 *         password:
 *           type: string
 *           format: password
 *           description: The user's password.
 */
class LoginDto {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }

  async validate() {
    try {
      if (!this.email || !this.password) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Email and password are required."
        );
      }
      await validEmail(this.email);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LoginDto;
