const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

/**
 * @swagger
 * components:
 *   schemas:
 *     VerifyEmailDto:
 *       type: object
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 *           description: Email verify token.
 */
class VerifyEmailDto {
  constructor(token) {
    this.token = token;
  }
  async validate() {
    try {
      if (!this.token) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Token is required"
        );
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = VerifyEmailDto;
