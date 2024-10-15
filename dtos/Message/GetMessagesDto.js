const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetMessagesDto {
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
    await validMongooseObjectId(this.roomId);
  }
}

module.exports = GetMessagesDto;
