const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdatePlaylistDto:
 *       type: object
 *       required:
 *         - addedVideoIds
 *       properties:
 *         addedVideoIds:
 *           type: array
 *           items:
 *            type: string
 *           description: The added video ids.
 *         removedVideoIds:
 *           type: array
 *           items:
 *            type: string
 *           description: The removed video ids. 
 *         playlistName:
 *            type: string
 *            description: The playlist's name.
 */
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
