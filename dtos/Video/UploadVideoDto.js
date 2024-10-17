const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class UploadVideoDto {
  constructor(userId, videoId, videoFile, videoThumbnailFile) {
    this.userId = userId;
    this.videoId = videoId;
    this.videoFile = videoFile;
    this.videoThumbnailFile = videoThumbnailFile;
  }

  async validate() {
    if (!this.userId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User ID is required"
      );
    }
    await validMongooseObjectId(this.userId);
    if (!this.videoId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Video ID is required"
      );
    }
    await validMongooseObjectId(this.videoId);
    if (!this.videoFile) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Video file is required"
      );
    }
    if (!this.videoThumbnailFile) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Video thumbnail file is required"
      );
    }
  }
}

module.exports = UploadVideoDto;
