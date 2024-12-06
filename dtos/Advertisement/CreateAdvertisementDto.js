/**
 * @swagger
 * components:
 *   schemas:
 *     CreateAdvertisementDto:
 *       type: object
 *       required:
 *         - videoId
 *         - packageId
 *       properties:
 *         videoId:
 *           type: string
 *           default: fasdjfhasdkjfh
 *           description: ID of video
 *         packageId:
 *           type: string
 *           default: fasdjfhasdkjfh
 *           description: ID of package
 */
const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class CreateAPackageDto {
  constructor(videoId, userId, packageId) {
    this.videoId = videoId;
    this.userId = userId;
    this.packageId = packageId;
  }
  async validate() {
    if (!this.videoId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "VideoId is required"
      );
    }
    try {
      await validMongooseObjectId(this.videoId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid videoId"
      );
    }
    if (!this.packageId) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "packageId is required"
      );
    }
    try {
      await validMongooseObjectId(this.packageId);
    } catch (error) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid packageId"
      );
    }
  }
}
module.exports = CreateAPackageDto;
