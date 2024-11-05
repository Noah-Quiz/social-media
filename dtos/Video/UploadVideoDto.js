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
    try {
      await validMongooseObjectId(this.userId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid User ID"
      );
    }
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
