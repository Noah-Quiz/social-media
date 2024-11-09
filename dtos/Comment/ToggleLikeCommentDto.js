const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class ToggleLikeCommentDto {
  constructor(commentId, userId) {
    this.commentId = commentId;
    this.userId = userId;
  }

  async validate() {
    if (!this.commentId)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Comment ID is required"
      );

    try {
      await validMongooseObjectId(this.commentId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid comment ID"
      );
    }

    if (!this.userId)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User ID is required"
      );
      
    try {
      await validMongooseObjectId(this.userId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid user ID"
      );
    }
  }
}

module.exports = ToggleLikeCommentDto;
