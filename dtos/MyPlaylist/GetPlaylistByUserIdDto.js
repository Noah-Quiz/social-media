const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetPlaylistByUserIdDto {
  constructor(requesterId, enumMode) {
    this.requesterId = requesterId;
    this.enumMode = enumMode;
  }

  async validate() {
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
    if (this.enumMode != null &&
      !["public", "private"].includes(
        this.enumMode
      )
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid enum mode, must be in ['public', 'private']"
      );
    }
  }
}

module.exports = GetPlaylistByUserIdDto;
