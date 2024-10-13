const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginGoogleDto:
 *       type: object
 *       required:
 *         - id
 *         - email
 *         - displayName
 *         - avavtar
 *       properties:
 *         id:
 *           type: string
 *           description: The user's google id.
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address.
 *         displayName:
 *           type: string
 *           description: The user's display name.
 *         avavtar:
 *           type: string
 *           description: The user's avatar.
 */
class LoginGoogleDto {
  constructor(id, email, displayName, avavtar) {
    this.id = id;
    this.email = email;
    this.displayName = displayName;
    this.avavtar = avavtar;
  }
  async validate() {
    if (!this.id) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "Id is required");
    }
    if (!this.email) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Email is required"
      );
    }
    if (!this.displayName) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Display name is required"
      );
    }
    if (!this.avavtar) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Avatar is required"
      );
    }
  }
}

module.exports = LoginGoogleDto;
