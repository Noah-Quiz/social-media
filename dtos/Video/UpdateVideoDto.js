const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class UpdateVideoDto {
  constructor(videoId, videoThumbnailFile) {
    this.videoId = videoId;
    this.videoThumbnailFile = videoThumbnailFile;
  }

  async validate() {
    if (!this.videoId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Video ID is required"
      );
    }
    await validMongooseObjectId(this.videoId);
    if (!this.videoThumbnailFile) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Video thumbnail file is required"
      );
    }
  }
}

module.exports = UpdateVideoDto;
