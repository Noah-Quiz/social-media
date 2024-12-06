const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetChildrenCommentsDto {
  constructor(commentId, size, requesterId) {
    this.commentId = commentId;
    this.size = size;
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
          "Invalid requester ID"
        );
      }
    }

    if (this.page && isNaN(this.page)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid query page, must be a positive integer"
      );
    }
    if (this.page && this.page < 0) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid query page, must be a positive integer"
      );
    }
    
    if (this.size && isNaN(this.size)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid query size, must be a positive integer"
      );
    }
    if (this.size && this.size < 0) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid query size, must be a positive integer"
      );
    }
  }
}

module.exports = GetChildrenCommentsDto;
