const { default: mongoose } = require("mongoose");
const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

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
    if (!mongoose.Types.ObjectId.isValid(this.userId)) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "Invalid userId");
    }
    if (!mongoose.Types.ObjectId.isValid(this.followId)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid followId"
      );
    }
    if (this.userId === this.followId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "You can't follow/unfollow yourself"
      );
    }
  }
}
module.exports = ToggleFollowDto;
