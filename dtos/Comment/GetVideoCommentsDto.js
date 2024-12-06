const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetVideoCommentsDto {
  constructor(videoId, sortBy, order, page, size, requesterId) {
    this.videoId = videoId;
    this.sortBy = sortBy;
    this.order = order;
    this.page = page;
    this.size = size;
    this.requesterId = requesterId;
  }
  async validate() {
    if (!this.videoId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Video ID is required"
      );
    }
    try {
      await validMongooseObjectId(this.videoId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid Video ID"
      );
    }

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

    // Validate `sortBy` and `order`
    const validSortByOptions = ["like", "date"];
    const validOrderOptions = ["ascending", "descending"];

    if (this.sortBy && !validSortByOptions.includes(this.sortBy)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid query sortBy, must be in ['like', 'date']"
      );
    }

    if (this.order && !validOrderOptions.includes(this.order)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid query order, must be in ['ascending', 'descending']"
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
      this.page = 1;
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
      this.size = 10;
    }

    const query = {
      videoId: this.videoId,
      size: this.size,
      page: this.page,
      sortBy: this.sortBy,
      order: this.order,
      requesterId: this.requesterId,
    };

    return query;
  }
}

module.exports = GetVideoCommentsDto;
