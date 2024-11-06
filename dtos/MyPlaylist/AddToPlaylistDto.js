const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     AddToPlaylistDto:
 *       type: object
 *       required:
 *         - playlistId
 *         - videoId
 *         - userId
 *       properties:
 *         playlistId:
 *           type: string
 *           description: The playlist ID to add the video to.
 *         videoId:
 *           type: string
 *           description: The ID of the video to add to the playlist.
 *         userId:
 *           type: string
 *           description: The ID of the user who owns the playlist.
 */
class AddToPlaylistDto {
  constructor(playlistId, videoId, userId) {
    this.playlistId = playlistId;
    this.videoId = videoId;
    this.userId = userId;
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

    if (!this.videoId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Video ID is required"
      );
    }
    try {
      await validMongooseObjectId(this.videoId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid Video ID"
      );
    }

    if (!this.userId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User ID is required"
      );
    }
    try {
      await validMongooseObjectId(this.userId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid User ID"
      );
    }
  }
}

module.exports = AddToPlaylistDto;
