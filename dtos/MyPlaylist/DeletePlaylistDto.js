const { default: mongoose } = require("mongoose");
const CoreException = require("../../exceptions/CoreException");
const StatusCodeEnums = require("../../enums/StatusCodeEnum");

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
    if (!mongoose.Types.ObjectId.isValid(this.playlistId)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid playlist ID"
      );
    }
  }
}
module.exports = DeletePlaylistDto;
