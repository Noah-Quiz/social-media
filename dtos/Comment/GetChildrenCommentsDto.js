const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetChildrenCommentsDto {
  constructor(commentId, limit) {
    this.commentId = commentId;
    this.limit = limit;
  }

  async validate() {
    if (!comment) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Missing required commentId field"
      );
    }
    await validMongooseObjectId(this.commentId);
    if (this.limit && isNaN(this.limit)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Limit must be a number"
      );
    }
    if (this.limit && this.limit < 0) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Limit must be greater than 0"
      );
    }
  }
}

module.exports = GetChildrenCommentsDto;
