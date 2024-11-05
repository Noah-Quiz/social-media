const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class UnlikeCommentDto {
  constructor(id, userId) {
    this.id = id;
    this.userId = userId;
  }

  async validate() {
    if (!this.id)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Comment id is required"
      );
    try {
      await validMongooseObjectId(this.id);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid comment id"
      );
    }
    if (!this.userId)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User id is required"
      );
    try {
      await validMongooseObjectId(this.userId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid user id"
      );
    }
  }
}

module.exports = UnlikeCommentDto;
