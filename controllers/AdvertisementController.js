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
const CoreException = require("../exceptions/CoreException");

class AdvertisementController {
  async createAnAdvertisementController(req, res, next) {
    try {
      const { userId, videoId, packageId } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(videoId)
      ) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid userId or videoId"
        );
      }

      const video = await getVideoService(videoId);

      const checkUserId = new mongoose.Types.ObjectId(userId);
      if (!video.userId.equals(checkUserId)) {
        console.log(video.userId);
        console.log(checkUserId);
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "User is not owner of this video"
        );
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
