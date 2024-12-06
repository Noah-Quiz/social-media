const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetHistoryRecordsDto {
  constructor(userId, page, size) {
    this.userId = userId;
    this.page = page;
    this.size = size;
  }

  async validate() {
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
    // Validate `page`
    if (this.page != null) {
      this.page = Number(this.page);
      if (
        Number.isNaN(this.page) ||
        !Number.isInteger(this.page) ||
        this.page < 1
      ) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid query page, must be a positive integer"
        );
      }
    } else {
      this.page = 1; // Default page if not provided
    }

    // Validate `size`
    if (this.size != null) {
      this.size = Number(this.size);
      if (
        Number.isNaN(this.size) ||
        !Number.isInteger(this.size) ||
        this.size < 1
      ) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid query size, must be a positive integer"
        );
      }
    } else {
      this.size = 10; // Default size if not provided
    }
  }
}

module.exports = GetHistoryRecordsDto;
