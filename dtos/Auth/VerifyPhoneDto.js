const { validPhoneNumber } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     VerifyPhoneDto:
 *       type: object
 *       required:
 *         - phoneNumber
 *       properties:
 *         phoneNumber:
 *           type: string
 *           description: The user's phone number.
 *           example: +84987654321
 */
class VerifyPhoneDto {
  constructor(phoneNumber) {
    this.phoneNumber = phoneNumber;
  }

  async validate() {
    try {
      await validPhoneNumber(this.phoneNumber);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = VerifyPhoneDto;
