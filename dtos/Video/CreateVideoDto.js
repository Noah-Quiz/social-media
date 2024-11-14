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
 *           description: Title of the video. Must be a minimum of 2 characters and a maximum of 100 characters.
 */

class CreateVideoDto {
  constructor(title) {
    this.title = title;
  }
  async validate() {
    try {
      if (!this.title) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Title is required"
        );
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CreateVideoDto;
