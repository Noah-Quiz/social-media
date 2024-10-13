const { default: mongoose } = require("mongoose");
const { validFullName } = require("../../utils/validator");
const CoreException = require("../../exceptions/CoreException");
const StatusCodeEnums = require("../../enums/StatusCodeEnum");

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserProfileDto:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *           description: The user's full name.
 *         nickName:
 *           type: string
 *           description: The user's nick name.
 *         avatar:
 *           type: string
 *           description: The user's avatar. And this is a url to the path of the image.
 */
class UpdateUserProfileDto {
  constructor(userId, fullName, nickName) {
    this.userId = userId;
    this.fullName = fullName;
    this.nickName = nickName;
  }
  async validate() {
    try {
      if (this.fullName) {
        await validFullName(this.fullName);
      }
      if (!mongoose.Types.ObjectId.isValid(this.userId)) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid user ID"
        );
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UpdateUserProfileDto;
