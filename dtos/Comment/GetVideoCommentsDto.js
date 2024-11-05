const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetVideoCommentsDto {
  constructor(videoId, sortBy) {
    this.videoId = videoId;
    this.sortBy = sortBy;
  }
  async validate() {
    if (!this.videoId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "VideoId is required"
      );
    }
    try {
      await validMongooseObjectId(this.videoId);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = GetVideoCommentsDto;
