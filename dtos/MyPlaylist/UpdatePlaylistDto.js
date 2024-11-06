const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdatePlaylistDto:
 *       type: object
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
  constructor(userId, playlistId, playlistName, description, thumbnail) {
    this.userId = userId;
    this.playlistName = playlistName;
    this.description = description;
    this.thumbnail = thumbnail;
    this.playlistId = playlistId;
  }

  async validate() {
    if (!this.playlistId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Playlist ID is required"
      );
    }
    try {
      await validMongooseObjectId(this.playlistId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid Playlist ID"
      );
    }

    if (!this.playlistName) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Playlist name is required"
      );
    }
  }
}

module.exports = UpdatePlaylistDto;
