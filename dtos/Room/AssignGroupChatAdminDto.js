const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class AssignGroupChatAdminDto {
  constructor(roomId, participantId) {
    this.roomId = roomId;
    this.participantId = participantId;
  }

  async validate() {
    try {
      if (!this.roomId) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Room ID is required"
        );
      }
      await validMongooseObjectId(this.roomId);
      if (!this.participantId) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Participant ID is required"
        );
      }
      await validMongooseObjectId(this.participantId);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AssignGroupChatAdminDto;
