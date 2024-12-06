const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetVideoLikeHistoryDto {
    constructor(page, size, title, userId) {
        this.page = page;
        this.size = size;
        this.title = title;
        this.userId = userId;
    }

    async validate() {
        if (this.userId) {
            try {
                await validMongooseObjectId(this.userId);
            } catch {
                throw new CoreException(
                    StatusCodeEnums.BadRequest_400,
                    `Invalid user ID`
                );
            }
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
            title: this.title,
            userId: this.userId,
        };

        return query;
    }
}

module.exports = GetVideoLikeHistoryDto;

