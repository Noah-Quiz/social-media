const { default: mongoose } = require("mongoose");
const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

class GetRecommendedVideosDto {
  constructor(page, size, requesterId) {
    this.page = page;
    this.size = size;
    this.requesterId = requesterId;
  }

  async validate() {
    if (this.requesterId && !mongoose.Types.ObjectId.isValid(this.requesterId)) {
        throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid requester ID"
        );
    }

    // Validate `page` and `size`
    if (this.page != null) {
      this.page = Number(this.page);
      if (Number.isNaN(this.page) || !Number.isInteger(this.page) || this.page < 1) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid query page, must be a positive integer"
        );
      }
    } else {
      this.page = 1; // Default page if not provided
    }

    if (this.size != null) {
      this.size = Number(this.size);
      if (Number.isNaN(this.size) || !Number.isInteger(this.size) || this.size < 1) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid query size, must be a positive integer"
        );
      }
    } else {
      this.size = 10; // Default size if not provided
    }

    const query = {
      size: this.size,
      page: this.page,
      requesterId: this.requesterId,
    };
    
    return query;
  }
}

module.exports = GetRecommendedVideosDto;
