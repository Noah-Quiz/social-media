const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

class GetVideosDto {
    constructor(size, page, enumMode, sortBy, order, title) {
        this.size = size;
        this.page = page;
        this.enumMode = enumMode;
        this.sortBy = sortBy;
        this.order = order;
        this.title = title;
    }

    async validate() {
        // Validate `enumMode`
        const validEnumModeOptions = ["draft", "public", "private", "unlisted", "member"];
        if (this.enumMode && !validEnumModeOptions.includes(this.enumMode)) {
            throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "Invalid query enumMode, must be one of ['draft', 'public', 'private', 'unlisted', 'member']"
            );
        }
        if (!this.enumMode) {
            this.enumMode = { $in: ['public', 'member'] };
        }

        // Validate `sortBy` and `order`
        const validSortByOptions = ["like", "view", "date"];
        const validOrderOptions = ["ascending", "descending"];

        if (this.sortBy && !validSortByOptions.includes(this.sortBy)) {
            throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "Invalid query sortBy, must be one of ['like', 'view', 'date']"
            );
        }

        if (this.order && !validOrderOptions.includes(this.order)) {
            throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "Invalid query order, must be one of ['ascending', 'descending']"
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
            title: this.title,
        };
        
        return query;
    }
}

module.exports = GetVideosDto;
