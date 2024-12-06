const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetPlaylistByUserIdDto {
  constructor(requesterId, enumMode, page, size, name) {
    this.requesterId = requesterId;
    this.enumMode = enumMode;
    this.page = page;
    this.size = size;
    this.name = name;
  }

  async validate() {
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

    if (this.enumMode != null &&
      !["public", "private"].includes(
        this.enumMode
      )
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid enum mode, must be in ['public', 'private']"
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
      enumMode: this.enumMode,
      sortBy: this.sortBy,
      order: this.order,
      name: this.name,
    };

    return query;
  }

}

module.exports = GetPlaylistByUserIdDto;
