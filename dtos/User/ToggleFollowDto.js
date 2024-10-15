const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     ToggleFollowDto:
 *       type: object
 *       required:
 *        - userId
 *        - followId
 *        - action
 *       properties:
 *         userId:
 *           type: string
 *           description: The user's id.
 *         followId:
 *           type: string
 *           description: The follower's id.
 *         action:
 *           type: string
 *           description: Action includes ["follow", "unfollow"].
 */
class ToggleFollowDto {
  constructor(userId, followId, action) {
    this.userId = userId;
    this.followId = followId;
    this.action = action;
  }
  async validate() {
    if (!["follow", "unfollow"].includes(this.action)) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "Invalid action");
    }
    await validMongooseObjectId(this.userId);

    await validMongooseObjectId(this.followId);

    if (this.userId === this.followId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "You can't follow/unfollow yourself"
      );
    }
  }
}
module.exports = ToggleFollowDto;
