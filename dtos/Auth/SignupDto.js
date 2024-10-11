const {
  validFullName,
  validPhoneNumber,
  validEmail,
  validPassword,
} = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     SignupDto:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - phoneNumber
 *         - password
 *       properties:
 *         fullName:
 *           type: string
 *           description: The user's full name.
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address.
 *         phoneNumber:
 *           type: string
 *           description: The user's phone number.
 *           example: +84987654321
 *         password:
 *           type: string
 *           format: password
 *           description: The user's password.
 */
class SignupDto {
  constructor(fullName, email, phoneNumber, password) {
    this.fullName = fullName;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.password = password;
  }

  async validate() {
    try {
      await validFullName(this.fullName);
      await validEmail(this.email);
      await validPhoneNumber(this.phoneNumber);
      await validPassword(this.password);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SignupDto;
