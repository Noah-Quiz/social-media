const {
  validFullName,
  validMongooseObjectId,
} = require("../../utils/validator");

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
      await validMongooseObjectId(this.userId);
      if (this.fullName) {
        await validFullName(this.fullName);
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UpdateUserProfileDto;
