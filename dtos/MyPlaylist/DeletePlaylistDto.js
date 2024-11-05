const CoreException = require("../../exceptions/CoreException");
const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const { validMongooseObjectId } = require("../../utils/validator");

class DeletePlaylistDto {
  constructor(playlistId) {
    this.playlistId = playlistId;
  }
  async validate() {
    if (!this.playlistId) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "playlistId is required"
      );
    }
    try {
      await validMongooseObjectId(this.playlistId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid playlistId"
      );
    }
  }
}
module.exports = DeletePlaylistDto;
