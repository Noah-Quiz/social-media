const { default: mongoose } = require("mongoose");
const {
  createAnAdvertisementService,
  getAllAvailableAdvertisementsService,
  updateAnAdvertisementByIdService,
  getAnAdvertisementByIdService,
  deleteAnAdvertisementByIdService,
  extendAdvertisementService,
} = require("../services/AdvertisementService");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const { getVideoService } = require("../services/VideoService");
const {
  getAPackageByIdService,
} = require("../services/AdvertisementPackageService");
const CoreException = require("../exceptions/CoreException");

class AdvertisementController {
  async createAnAdvertisementController(req, res, next) {
    const userId = req.userId;
    const { videoId, packageId } = req.body;
    try {
      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(videoId)
      ) {
        return res
          .status(StatusCodeEnums.BadRequest_400)
          .json({ message: "VideoId or UserId is not ObjectId" });
      }

      const video = await getVideoService(videoId);

      if (!video) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Video not found"
        );
      }
      const checkUserId = new mongoose.Types.ObjectId(userId);
      if (!video.user._id.equals(checkUserId)) {
        return res
          .status(StatusCodeEnums.BadRequest_400)
          .json({ message: "This user does not own this video" });
      }
      if (video.enumMode != "public" && video.enumMode != "member") {
        return res.status(StatusCodeEnums.BadRequest_400).json({
          message: "Type of video for advertisement must be public or member",
        });
      }
      const result = await createAnAdvertisementService(
        userId,
        videoId,
        packageId
      );
      return res.status(StatusCodeEnums.Created_201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async extendAdvertisementController(req, res, next) {
    const { adsId, packageId } = req.body;
    try {
      const result = await extendAdvertisementService(adsId, packageId);
      return res.status(StatusCodeEnums.OK_200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAllAvailableAdvertisementsController(req, res, next) {
    try {
      const result = await getAllAvailableAdvertisementsService();
      return res.status(StatusCodeEnums.OK_200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateAnAdvertisementByIdController(req, res, next) {
    const { adsId, coin, expDate } = req.body;
    try {
      const result = await updateAnAdvertisementByIdService(
        adsId,
        coin,
        expDate
      );
      return res.status(StatusCodeEnums.OK_200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAnAdvertisementByIdController(req, res, next) {
    const { adsId } = req.params;
    try {
      const result = await getAnAdvertisementByIdService(adsId);
      return res.status(StatusCodeEnums.OK_200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async deleteAnAdvertisementByIdController(req, res, next) {
    const { adsId } = req.params;
    try {
      const result = await deleteAnAdvertisementByIdService(adsId);
      return res.status(StatusCodeEnums.OK_200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdvertisementController;
