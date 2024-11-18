const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

class CreateRoomDto {
    constructor(name, enumMode) {
        this.name = name;
        this.enumMode = enumMode;
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

        const validEnumModeOptions = ["public", "private", "group", "member"];
        if (!this.enumMode) {
            throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "Enum mode is required"
            );
        }
        if (!validEnumModeOptions.includes(this.enumMode)) {
            throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "Invalid enumMode, must be one of ['public', 'private', 'group', 'member']"
            );
        }
    }
}

module.exports = CreateRoomDto;
