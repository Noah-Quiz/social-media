const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreatePlaylistDto:
 *       type: object
 *       required:
 *         - playlistName
 *       properties:
 *         playlistName:
 *           type: string
 *           description: The playlist's name. Must be a minimum of 2 characters and a maximum of 100 characters.
 */
class CreatePlaylistDto {
  constructor(userId, playlistName, enumMode) {
    this.userId = userId;
    this.playlistName = playlistName;
    this.enumMode = enumMode;
  }

  async validate() {
    if (!this.userId)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User ID is required"
      );
    try {
      await validMongooseObjectId(this.userId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid User ID"
      );
    }
    if (!this.playlistName)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Playlist name is required"
      );
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

module.exports = CreatePlaylistDto;
