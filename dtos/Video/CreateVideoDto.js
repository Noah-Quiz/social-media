const { default: mongoose } = require("mongoose");
const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");

class CreateVideoDto {
  constructor(title, description, enumMode, categoryIds) {
    this.title = title;
    this.description = description;
    this.enumMode = enumMode;
    this.categoryIds = categoryIds;
  }
  async validate() {
    try {
      if (["public", "private", "unlisted"].includes(this.enumMode)) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid video accessibility"
        );
      }
      if (this.categoryIds && !Array.isArray(this.categoryIds)) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "CategoryIds must be an array"
        );
      }
      if(this.categoryIds && this.categoryIds.length !== 0) {
        this.categoryIds.forEach((id) => {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CoreException(
              StatusCodeEnums.BadRequest_400,
              `Invalid category ID`
            );
          }
        });
      }
    } catch (error) {
        throw error;
    }
  }
}

module.exports = CreateVideoDto;
