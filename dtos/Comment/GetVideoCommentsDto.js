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
    await validMongooseObjectId(this.videoId);
  }
}

module.exports = GetVideoCommentsDto;
