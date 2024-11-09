const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetChildrenCommentsDto {
  constructor(commentId, limit, requesterId) {
    this.commentId = commentId;
    this.limit = limit;
    this.requesterId = requesterId;
  }

  async validate() {
    if (!this.commentId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Comment ID is required"
      );
    }
    try {
      await validMongooseObjectId(this.commentId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid comment ID"
      );
    }
    
    if (this.requesterId) {
      try {
        await validMongooseObjectId(this.commentId);
      } catch (error) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid comment ID"
        );
      }
    }
    
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
