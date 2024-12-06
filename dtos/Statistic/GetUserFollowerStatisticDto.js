const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

const { validMongooseObjectId } = require("../../utils/validator");
const dayjs = require("dayjs");

class getUserFollowerStatisticDto {
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
    const currentDate = dayjs();
    if (this.TimeUnit === "MONTH" && this.value !== undefined) {
      if (
        isNaN(this.value) || // Must be a number
        !Number.isInteger(Number(this.value)) || // Must be an integer
        this.value < 1 || // Must be at least 1
        this.value > 12 // Cannot exceed 12
      ) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid value in month case: value must be an integer between 1 and 12"
        );
      }
      const currentMonth = currentDate.month() + 1; // dayjs months are 0-indexed
      if (this.value > currentMonth) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid value in month case: cannot specify a future month"
        );
      }
    }

    if (
      this.TimeUnit === "YEAR" &&
      this.value !== undefined &&
      this.value !== "" &&
      this.value !== null
    ) {
      if (
        isNaN(this.value) || // Must be a number
        !Number.isInteger(Number(this.value)) || // Must be an integer
        this.value < 2024 // Must be 2024 or greater
      ) {
        console.log(
          isNaN(this.value),
          !Number.isInteger(this.value),
          this.value < 2024
        );
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid value in year case: year must be a positive integer starting from 2024"
        );
      }
      const currentYear = currentDate.year();
      if (this.value > currentYear) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid value in year case: cannot specify a future year"
        );
      }
    }
  }
}

module.exports = getUserFollowerStatisticDto;
