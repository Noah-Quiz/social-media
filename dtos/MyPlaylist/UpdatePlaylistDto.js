const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const mongoose = require("mongoose");
class UpdatePlaylistDto {
  constructor(addedVideoIds, removedVideoIds, playlistName, playListId) {
    this.addedVideoIds = addedVideoIds;
    this.removedVideoIds = removedVideoIds;
    this.playlistName = playlistName;
    this.playListId = playListId;
  }
  async validate() {
    try {
      if (this.addedVideoIds && !Array.isArray(this.addedVideoIds)) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "addedVideoIds must be an array"
        );
      }
      if (this.removedVideoIds && !Array.isArray(this.removedVideoIds)) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "removedVideoIds must be an array"
        );
      }
      if (this.addedVideoIds && this.addedVideoIds.length !== 0) {
        this.addedVideoIds.forEach((id) => {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CoreException(
              StatusCodeEnums.BadRequest_400,
              `Invalid video ID: ${id}. Cannot add`
            );
          }
        });
      }
      if (this.removedVideoIds && this.removedVideoIds.length !== 0) {
        this.removedVideoIds.forEach((id) => {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CoreException(
              StatusCodeEnums.BadRequest_400,
              `Invalid video ID: ${id}. Cannot remove`
            );
          }
        });
      }
      if (
        this.playListId &&
        !mongoose.Types.ObjectId.isValid(this.playListId)
      ) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          `Invalid playlist ID: ${this.playListId}`
        );
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UpdatePlaylistDto;