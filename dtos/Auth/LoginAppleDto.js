const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginAppleDto:
 *       type: object
 *       required:
 *         - id_token
 *         - email
 *         - firstName
 *         - lastName
 *       properties:
 *         id_token:
 *           type: string
 *           description: The token apple send back, it includes user's email.
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address.
 *         firstName:
 *           type: string
 *           description: The user's first name.
 *         lastName:
 *           type: string
 *           description: The user's last name.
 */
class LoginAppleDto {
  constructor(id_token, email, firstName, lastName) {
    this.id_token = id_token;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  async validate() {
    if (!this.id_token) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "id_token is required"
      );
    }
  }
}

module.exports = LoginAppleDto;
