const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

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
                "Invalid sortBy, must be one of ['like', 'view', 'date']"
            );
        }

        if (this.order && !validOrderOptions.includes(this.order)) {
            throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "Invalid order, must be one of ['ascending', 'descending']"
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

        // Construct query object with validated parameters
        const query = {
            size: this.size,
            page: this.page,
            status: this.status,
            sortBy: this.sortBy,
            order: this.order,
        };
        
        return query;
    }
}

module.exports = GetStreamsDto;
