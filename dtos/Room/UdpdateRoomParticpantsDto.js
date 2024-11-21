const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class UpdateRoomParticipantsDto {
    constructor(roomId, userId) {
        this.roomId = roomId;
        this.userId = userId;
    }

    async validate() {
        if (!this.roomId) {
            throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "Room ID is required"
            );
        }

        try {
            validMongooseObjectId(this.roomId);
        } catch (error) {
            throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "Invalid Room ID"
            );
        }

        if (!this.userId) {
            throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "User ID is required"
            );
        }

        try {
            validMongooseObjectId(this.userId);
        } catch (error) {
            throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "Invalid User ID"
            );
        }
    }
}

module.exports = UpdateRoomParticipantsDto;
