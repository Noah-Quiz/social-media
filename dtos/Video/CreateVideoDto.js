const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateVideoDto:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the video
 *         description:
 *           type: string
 *           description: Description of the video
 *         categoryIds:
 *           type: array
 *           default: []
 *           description: A list of category IDs
 *         enumMode:
 *           type: string
 *           default: public
 *           description: Value of enum mode [public, private, unlisted]
 */

class CreateVideoDto {
  constructor(title, description, enumMode, categoryIds) {
    this.title = title;
    this.description = description;
    this.enumMode = enumMode;
    this.categoryIds = categoryIds;
  }
  async validate() {
    try {
      if (!this.title) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Title is required"
        );
      }
      if (!["public", "private", "unlisted", "member"].includes(this.enumMode)) {
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
