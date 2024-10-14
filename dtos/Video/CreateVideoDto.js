const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

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
      if (this.categoryIds && this.categoryIds.length !== 0) {
        this.categoryIds.forEach(async (id) => {
          await validMongooseObjectId(id);
        });
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CreateVideoDto;
