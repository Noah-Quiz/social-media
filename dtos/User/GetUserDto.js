const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetUserDto {
    constructor(userId, requesterId) {
        this.userId = userId;
        this.requesterId = requesterId;
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

module.exports = GetUserDto;

