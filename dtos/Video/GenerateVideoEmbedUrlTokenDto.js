const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GenerateVideoEmbedUrlTokenDto {
  constructor(videoId, dateExpire) {
    this.videoId = videoId;
    this.dateExpire = dateExpire;
  }

  async validate() {
    if (!this.videoId || !this.dateExpire) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Video ID and date expire are required"
      );
    }
    await validMongooseObjectId(this.videoId);

    if (isNaN(this.dateExpire) || this.dateExpire <= 0) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "dateExpire must be a valid UNIX timestamp"
      );
    }
  }
}

module.exports = GenerateVideoEmbedUrlTokenDto;
