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
 *           description: The added video ids. Must be a minimum of 1 characters and a maximum of 2000 characters.
 *         removedVideoIds:
 *           type: array
 *           items:
 *            type: string
 *           description: The removed video ids.
 *         playlistName:
 *            type: string
 *            description: The playlist's name. Must be a minimum of 2 characters and a maximum of 100 characters.
 */
class UpdatePlaylistDto {
  constructor(
    userId,
    playlistId,
    playlistName,
    description,
    thumbnail,
    enumMode
  ) {
    this.userId = userId;
    this.playlistName = playlistName;
    this.description = description;
    this.thumbnail = thumbnail;
    this.playlistId = playlistId;
    this.enumMode = enumMode;
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
    if (
      this.enumMode != null &&
      !["public", "private"].includes(this.enumMode)
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid enum mode, must be in ['public', 'private']"
      );
    }
  }
}

module.exports = UpdatePlaylistDto;
