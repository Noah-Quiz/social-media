const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class GetRelevantVideosDto {
    constructor(page, size, categoryIds, requesterId) {
        this.page = page;
        this.size = size;
        this.requesterId = requesterId;
        this.rawCategoryIds = categoryIds;
        this.categoryIds = [];
    }

    async validate() {
        if (this.requesterId) {
            try {
                await validMongooseObjectId(this.requesterId);
            } catch {
                throw new CoreException(
                    StatusCodeEnums.BadRequest_400,
                    `Invalid requester ID`
                );
            }
        }

        this.categoryIds = [];

        if (this.rawCategoryIds) {
            this.categoryIds = this.rawCategoryIds.split(",").map((id) => id.trim());

            if (this.categoryIds.length === 0) {
                throw new CoreException(
                    StatusCodeEnums.BadRequest_400,
                    "Category IDs must not be empty"
                );
            }

            // Validate each ID
            for (const id of this.categoryIds) {
                if (!id || typeof id !== "string") {
                    throw new CoreException(
                        StatusCodeEnums.BadRequest_400,
                        "Each Category ID must be a non-empty string"
                    );
                }

                try {
                    await validMongooseObjectId(id);
                } catch {
                    throw new CoreException(
                        StatusCodeEnums.BadRequest_400,
                        `Invalid Category ID: ${id}`
                    );
                }
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
            categoryIds: this.categoryIds,
            requesterId: this.requesterId,
        };

        return query;
    }
}

module.exports = GetRelevantVideosDto;
