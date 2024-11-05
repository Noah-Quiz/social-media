const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetVideosByPlaylistIdDto {
  constructor(playlistId, page, size, order, sortBy) {
    this.playlistId = playlistId;
    this.page = page;
    this.size = size;
    this.order = order;
    this.sortBy = sortBy;
  }
  async validate() {
    if (!this.playlistId)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "PlaylistId is required"
      );
    try {
      await validMongooseObjectId(this.playlistId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid PlaylistId"
      );
    }

    if (this.page && this.page < 1) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Page cannot be less than 1"
      );
    }

    if (this.size && this.size < 1) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Size cannot be less than 1"
      );
    }

    // Validate `sortBy` and `order`
    const validSortByOptions = ["like", "view", "date"];
    const validOrderOptions = ["ascending", "descending"];

    if (this.sortBy && !validSortByOptions.includes(this.sortBy)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid query sortBy, must be in ['like', 'view', 'date']"
      );
    }

    if (this.order && !validOrderOptions.includes(this.order)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid query order, must be in ['ascending', 'descending']"
      );
    }
  }
}

module.exports = GetVideosByPlaylistIdDto;
