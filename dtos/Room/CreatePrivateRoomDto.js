const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class CreatePrivateRoomDto {
    constructor(userId, recipientId) {
        this.userId = userId;
        this.recipientId = recipientId;
    }

    async validate() {
        if (!this.recipientId) {
            throw new CoreException(StatusCodeEnums.BadRequest_400, "Recipient ID is required");
        }

        try {
            await validMongooseObjectId(this.recipientId);
        } catch (error) {
            throw new CoreException(StatusCodeEnums.BadRequest_400, "Invalid recipient ID");
        }

        if (this.userId?.toString() === this.recipientId?.toString()) {
            throw new CoreException(StatusCodeEnums.BadRequest_400, "Cannot create room with yourself as the recipient");
        }
    }
}

module.exports = CreatePrivateRoomDto;
