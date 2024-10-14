const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const mongoose = require("mongoose");
const { validMongooseObjectId } = require("../../utils/validator");
class UpdatePlaylistDto {
  constructor(addedVideoIds, removedVideoIds, playlistName, playListId) {
    this.addedVideoIds = addedVideoIds;
    this.removedVideoIds = removedVideoIds;
    this.playlistName = playlistName;
    this.playListId = playListId;
  }
  async validate() {
    try {
      if (!this.playListId) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Playlist ID is required"
        );
      }
      await validMongooseObjectId(this.playListId);
      
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
        this.addedVideoIds.forEach(async (id) => {
          await validMongooseObjectId(id);
        });
      }
      if (this.removedVideoIds && this.removedVideoIds.length !== 0) {
        this.removedVideoIds.forEach(async (id) => {
          await validMongooseObjectId(id);
        });
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UpdatePlaylistDto;
