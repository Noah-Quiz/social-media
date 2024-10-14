const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class DeleteHistoryRecordDto {
  constructor(historyId) {
    this.historyId = historyId;
  }
  async validate() {
    if (!this.historyId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "History ID is required"
      );
    }
    await validMongooseObjectId(this.historyId);
  }
}

module.exports = DeleteHistoryRecordDto;
