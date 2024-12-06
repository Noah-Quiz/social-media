const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class DeleteCategoryDto {
  constructor(categoryId) {
    this.categoryId = categoryId;
  }

  async validate() {
    if (!this.categoryId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Category ID is required"
      );
    }
    try {
      await validMongooseObjectId(this.categoryId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid category ID"
      );
    }
  }
}

module.exports = DeleteCategoryDto;
