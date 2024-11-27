const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetViewStatisticDto {
  constructor(ownerId, TimeUnit, value) {
    this.ownerId = ownerId;
    this.TimeUnit = TimeUnit;
    this.value = value;
  }

  async validate() {
    if (!this.ownerId) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "ID is required");
    }
    try {
      await validMongooseObjectId(this.ownerId); // Ensure this is awaited
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid ownerID"
      );
    }

    if (!["DAY", "WEEK", "MONTH", "YEAR"].includes(this.TimeUnit)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid TimeUnit"
      );
    }

    if (this.TimeUnit === "MONTH" && this.value !== undefined) {
      if (
        isNaN(this.value) || // Must be a number
        !Number.isInteger(this.value) || // Must be an integer
        this.value < 1 || // Must be at least 1
        this.value > 12 // Cannot exceed 12
      ) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid value in month case: value must be an integer between 1 and 12"
        );
      }
    }

    if (this.TimeUnit === "YEAR" && this.value !== undefined) {
      if (
        isNaN(this.value) || // Must be a number
        !Number.isInteger(this.value) || // Must be an integer
        this.value < 2024 // Must be 2024 or greater
      ) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid value in year case: year must be a positive integer starting from 2024"
        );
      }
    }
  }
}

module.exports = GetViewStatisticDto;
