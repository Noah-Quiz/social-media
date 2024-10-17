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
 *         - userId
 *         - title
 *         - description
 *         - categoryIds
 *         - enumMode
 *         - bunnyId
 *         - videoUrl
 *       properties:
 *         userId:
 *           type: string
 *           default: 670621c0fe62bfae8a44d099
 *           description: ID of the user
 *         title:
 *           type: string
 *           default: example
 *           description: Title of the video
 *         description:
 *           type: string
 *           default: example description
 *           description: Description of the video
 *         categoryIds:
 *           type: array
 *           default: []
 *           description: A list of category IDs
 *         enumMode:
 *           type: string
 *           default: public
 *           description: Value of enum mode [public, private, unlisted]
 *         bunnyId:
 *           type: string
 *           default: 12345
 *           description: Bunny CDN ID returned and placed here
 *         videoUrl:
 *           type: string
 *           default: https://example.com
 *           description: URL of the video
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
