const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetVideoCommentsDto {
  constructor(videoId, sortBy, order, requesterId) {
    this.videoId = videoId;
    this.sortBy = sortBy;
    this.sortBy = sortBy;
    this.requesterId = requesterId;
  }
  async validate() {
    if (!this.videoId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Video ID is required"
      );
    }
    try {
      await validMongooseObjectId(this.videoId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid Video ID"
      );
    }

    if (this.requesterId) {
      try {
        await validMongooseObjectId(this.requesterId);
      } catch (error) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid requester ID"
        );
      }
    }
    
    // Validate `sortBy` and `order`
    const validSortByOptions = ["like", "date"];
    const validOrderOptions = ["ascending", "descending"];

    if (this.sortBy && !validSortByOptions.includes(this.sortBy)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid query sortBy, must be in ['like', 'date']"
      );
    }

    if (this.order && !validOrderOptions.includes(this.order)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid query order, must be in ['ascending', 'descending']"
      );
    }
  }
}

module.exports = GetVideoCommentsDto;
