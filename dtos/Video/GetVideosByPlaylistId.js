const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetVideosByPlaylistIdDto {
  constructor(playlistId, page, size) {
    this.playlistId = playlistId;
    this.page = page;
    this.size = size;
  }
  async validate() {
    if (!this.playlistId)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "PlaylistId is required"
      );
    await validMongooseObjectId(this.playlistId);

    if (this.page && this.page < 1)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Page cannot be less than 1"
      );

    if (this.size && this.size < 1)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Size cannot be less than 1"
      );
  }
}

module.exports = GetVideosByPlaylistIdDto;
