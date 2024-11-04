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

class AdvertisementController {
  async createAnAdvertisementController(req, res) {
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

      const checkUserId = new mongoose.Types.ObjectId(userId);
      if (!video.userId.equals(checkUserId)) {
        return res
          .status(StatusCodeEnums.BadRequest_400)
          .json({ message: "This user does not own this video" });
      }
      if (video.enumMode != "public" || video.enumMode != "member") {
        return res
          .status(StatusCodeEnums.BadRequest_400)
          .json({
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
      return res
        .status(StatusCodeEnums.InternalServerError_500)
        .json({ message: error.message });
    }
  }

  async extendAdvertisementController(req, res) {
    const { adsId, packageId } = req.body;
    try {
      const result = await extendAdvertisementService(adsId, packageId);
      return res.status(StatusCodeEnums.OK_200).json({ data: result });
    } catch (error) {
      return res
        .status(StatusCodeEnums.InternalServerError_500)
        .json({ message: error.message });
    }
  }

  async getAllAvailableAdvertisementsController(req, res) {
    try {
      const result = await getAllAvailableAdvertisementsService();
      return res.status(StatusCodeEnums.OK_200).json({ data: result });
    } catch (error) {
      return res
        .status(StatusCodeEnums.InternalServerError_500)
        .json({ message: error.message });
    }
  }

  async updateAnAdvertisementByIdController(req, res) {
    const { adsId, coin, expDate } = req.body;
    try {
      const result = await updateAnAdvertisementByIdService(
        adsId,
        coin,
        expDate
      );
      return res.status(StatusCodeEnums.OK_200).json({ data: result });
    } catch (error) {
      return res
        .status(StatusCodeEnums.InternalServerError_500)
        .json({ message: error.message });
    }
  }

  async getAnAdvertisementByIdController(req, res) {
    const { adsId } = req.params;
    try {
      const result = await getAnAdvertisementByIdService(adsId);
      return res.status(StatusCodeEnums.OK_200).json({ data: result });
    } catch (error) {
      return res
        .status(StatusCodeEnums.InternalServerError_500)
        .json({ message: error.message });
    }
  }

  async deleteAnAdvertisementByIdController(req, res) {
    const { adsId } = req.params;
    try {
      const result = await deleteAnAdvertisementByIdService(adsId);
      return res.status(StatusCodeEnums.OK_200).json({ data: result });
    } catch (error) {
      return res
        .status(StatusCodeEnums.InternalServerError_500)
        .json({ message: error.message });
    }
  }
}

module.exports = AdvertisementController;
