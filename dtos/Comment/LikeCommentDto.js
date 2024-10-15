const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class LikeCommentDto {
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
    await validMongooseObjectId(this.id);
    if (!this.userId)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User id is required"
      );
    await validMongooseObjectId(this.userId);
  }
}

module.exports = LikeCommentDto;
