const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     StreamRecommendationDto:
 *       type: object
 *       properties:
 *         categoryIds:
 *           type: array
 *           items:
 *            type: string
 *           description: The category ids.
 */

class StreamRecommendationDto {
  constructor(categoryIds) {
    this.categoryIds = categoryIds;
  }

  async validate() {
    console.log(typeof this.categoryIds);
    if (this.categoryIds !== null && !Array.isArray(this.categoryIds)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Category IDs must be an array"
      );
    }
    if (this.categoryIds && this.categoryIds.length > 0) {
      await Promise.all(
        this.categoryIds.map(async (id) => {
          if (id || id.length > 0) {
            try {
              await validMongooseObjectId(id);
            } catch (error) {
              throw new CoreException(
                StatusCodeEnums.BadRequest_400,
                "Invalid Category ID"
              );
            }
          }
        })
      );
    }
  }
}

module.exports = StreamRecommendationDto;
