const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateVideoDto:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - categoryIds
 *         - enumMode
 *       properties:
 *         title:
 *           type: string
 *           default: example
 *           description: Video's title. Must be a minimum of 2 characters and a maximum of 100 characters.
 *         description:
 *           type: string
 *           default: example description
 *           description: Video's description. Must be a minimum of 1 characters and a maximum of 2000 characters.
 *         categoryIds:
 *           type: array
 *           default: []
 *           description: A list of category IDs
 *         enumMode:
 *           type: string
 *           default: public
 *           description: Value of enum mode [public, private, unlisted, member, draft]
 */

class UpdateVideoDto {
  constructor(
    videoId,
    title,
    description,
    enumMode,
    categoryIds,
    videoThumbnailFile = null // Mark as optional
  ) {
    this.videoId = videoId;
    this.title = title;
    this.description = description;
    this.enumMode = enumMode;
    this.categoryIds = categoryIds;
    this.videoThumbnailFile = videoThumbnailFile;
  }

  async validate() {
    if (!this.videoId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Video ID is required"
      );
    }
    try {
      await validMongooseObjectId(this.videoId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid Video ID"
      );
    }
    if (
      this.enumMode != null &&
      !["public", "private", "unlisted", "member", "draft"].includes(
        this.enumMode
      )
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid enum mode, must be in ['public', 'private', 'unlisted', 'member', 'draft']"
      );
    }
    if (this.categoryIds !== null && !Array.isArray(this.categoryIds)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Category IDs must be an array"
      );
    }
    if (this.categoryIds && this.categoryIds.length > 0) {
      await Promise.all(
        this.categoryIds.map(async (id) => {
          if (id || id.length > 0 || id === "") {
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
    // if (!this.videoThumbnailFile) {
    //   throw new CoreException(
    //     StatusCodeEnums.BadRequest_400,
    //     "Video thumbnail is required"
    //   );
    // }
  }
}

module.exports = UpdateVideoDto;
