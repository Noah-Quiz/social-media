const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetUserRoomsDto {
  constructor(title, page, size) {
    this.title = title;
    this.page = page;
    this.size = size;
  }
  async validate() {
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
        this.size = 10;
    }

    const query = {
        page: this.page,
        size: this.size,
        title: this.title,
    }

    return query;
  }
}

module.exports = GetUserRoomsDto;
