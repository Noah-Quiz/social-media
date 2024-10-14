const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class DeleteCategoryDto {
  constructor(categoryId) {
    this.categoryId = categoryId;
  }

  async validate() {
    try {
      if (!this.categoryId) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Valid category ID is required"
        );
      }
      await validMongooseObjectId(this.categoryId);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DeleteCategoryDto;
