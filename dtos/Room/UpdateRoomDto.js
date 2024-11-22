const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class UpdateRoomDto {
    constructor(roomId) {
        this.roomId = roomId;
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
    }
}

module.exports = UpdateRoomDto;
