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

class CreateAPackageDto {
  constructor(videoId, userId, packageId) {
    this.videoId = videoId;
    this.userId = userId;
    this.packageId = packageId;
  }
}
