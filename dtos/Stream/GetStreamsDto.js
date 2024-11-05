const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetStreamsDto {
    constructor(size, page, status, sortBy, order) {
        this.size = size;
        this.page = page;
        this.status = status;
        this.sortBy = sortBy;
        this.order = order;
    }

    async validate() {

        // Validate `sortBy` and `order`
        const validSortByOptions = ["like", "view", "date"];
        const validOrderOptions = ["ascending", "descending"];

        if (this.sortBy && !validSortByOptions.includes(this.sortBy)) {
            throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "Invalid this sortBy, must be in ['like', 'view', 'date']"
            );
        }

        if (this.order && !validOrderOptions.includes(this.order)) {
            throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "Invalid this order, must be in ['ascending', 'descending']"
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

module.exports = GetStreamsDto;
