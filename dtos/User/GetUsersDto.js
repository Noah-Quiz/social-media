const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetUsersDto {
    constructor(page, size, order, sortBy) {
        this.page = page;
        this.size = size;
        this.order = order;
        this.sortBy = sortBy;
    }

    async validate() {
        // Validate `sortBy` and `order`
        const validSortByOptions = ["follower", "date"];
        const validOrderOptions = ["ascending", "descending"];

        if (this.sortBy && !validSortByOptions.includes(this.sortBy)) {
            throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "Invalid query sortBy, must be in ['follower', 'date']"
            );
        }

        if (this.order && !validOrderOptions.includes(this.order)) {
            throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "Invalid query order, must be in ['ascending', 'descending']"
            );
        }

        // Validation checks for `page` and `size`
        if (this.page) this.page = Number(this.page);
        if (this.size) this.size = Number(this.size);
        if (!Number.isInteger(this.page)) {
            throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "Invalid query page"
            );
        }
        if (this.page < 1) {
            throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "Page cannot be less than 1"
            );
        }
        if (!Number.isInteger(this.size)) {
            throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "Invalid query size"
            );
        }
        if (this.size < 1) {
            throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "Size cannot be less than 1"
            );
        }
    }
}

module.exports = GetUsersDto;

