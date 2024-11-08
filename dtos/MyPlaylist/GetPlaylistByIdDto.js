const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetPlaylistByIdDto {
    constructor(playlistId, requesterId) {
        this.playlistId = playlistId;
        this.requesterId = requesterId;
    }

    async validate() {
        if (!this.playlistId) {
            throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "Playlist ID is required"
            );
        }
        if (this.playlistId) {
            try {
                await validMongooseObjectId(this.playlistId);
            } catch (error) {
                throw new CoreException(
                    StatusCodeEnums.BadRequest_400,
                    "Invalid playlist ID"
                );
            }
        }

        if (this.requesterId) {
            try {
                await validMongooseObjectId(this.requesterId);
            } catch (error) {
                throw new CoreException(
                    StatusCodeEnums.BadRequest_400,
                    "Invalid requester ID"
                );
            }
        }
    }
}

module.exports = GetPlaylistByIdDto;
