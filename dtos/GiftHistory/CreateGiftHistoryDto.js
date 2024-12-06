const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class CreateGiftHistoryDto {
  constructor(streamId, gifts) {
    this.streamId = streamId;
    this.gifts = gifts;
  }

  async validate() {
    // Validate streamId presence and format
    if (!this.streamId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Stream ID is required."
      );
    }
    try {
      await validMongooseObjectId(this.streamId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid streamId"
      );
    }

    // Validate that gifts array is not empty
    if (!Array.isArray(this.gifts) || this.gifts.length === 0) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Gifts array cannot be empty."
      );
    }

    // Validate each gift object in the array
    for (const [index, gift] of this.gifts.entries()) {
      // Check for giftId presence and validity
      if (!gift.hasOwnProperty("giftId")) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          `Gift at index ${index} must have a giftId field.`
        );
      }
      try {
        await validMongooseObjectId(gift.giftId);
      } catch (error) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          `Invalid giftId at index ${index}: ${gift.giftId}.`
        );
      }

      // Check for quantity presence and validity
      if (!gift.hasOwnProperty("quantity")) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          `Gift at index ${index} must have a quantity field.`
        );
      }
      if (!Number.isInteger(gift.quantity) || gift.quantity <= 0) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          `Quantity at index ${index} must be an integer greater than 0.`
        );
      }
    }
  }
}

module.exports = CreateGiftHistoryDto; //now ?
