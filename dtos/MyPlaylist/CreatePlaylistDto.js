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
 *           description: The playlist's name.
 */
class CreatePlaylistDto {
  constructor(userId, playlistName) {
    this.userId = userId;
    this.playlistName = playlistName;
  }

  async validate() {
    if (!this.userId)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User ID is required"
      );
    await validMongooseObjectId(this.userId);
    if (!this.playlistName)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Playlist name is required"
      );
  }
}

module.exports = CreatePlaylistDto;
