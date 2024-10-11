const { validEmail } = require("../../utils/validator");

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
}

module.exports = VerifyEmailDto;
