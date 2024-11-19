const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

class CreateMemberRoomDto {
    constructor(name) {
        this.name = name;
    }

    async validate() {
        try {
            if (this.enumMode !== "private" && !this.name) {
                throw new CoreException(
                    StatusCodeEnums.BadRequest_400,
                    "Name is required"
                );
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CreateMemberRoomDto;
