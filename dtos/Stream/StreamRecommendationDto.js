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
  constructor(streamerId, categoryIds) {
    this.categoryIds = categoryIds;
  }

  async validate() {
    if (this.categoryIds && !Array.isArray(this.categoryIds)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Category IDs must be an array"
      );
    }
    if (this.categoryIds) {
      this.categoryIds.forEach(async (id) => {
        try {
          await validMongooseObjectId(id);
        } catch (error) {
          throw new CoreException(
            StatusCodeEnums.BadRequest_400,
            `Invalid category ID: ${id}`
          );
        }
      });
    }
  }
}

module.exports = StreamRecommendationDto;
