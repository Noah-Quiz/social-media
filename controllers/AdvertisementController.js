const { default: mongoose } = require("mongoose");
const {
  createAnAdvertisementService,
  getAllAvailableAdvertisementsService,
  updateAnAdvertisementByIdService,
  getAnAdvertisementByIdService,
  deleteAnAdvertisementByIdService,
} = require("../services/AdvertisementService");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const { getVideoService } = require("../services/VideoService");

class AdvertisementController {
  async createAnAdvertisementController(req, res) {
    const { userId, videoId, coin, expDate } = req.body;

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
      console.log(video.userId);
      console.log(checkUserId);
      return res
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "This user does not own this video" });
    }

    try {
      const result = await createAnAdvertisementService(
        userId,
        videoId,
        coin,
        expDate
      );
      return res.status(StatusCodeEnums.Created_201).json({ data: result });
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
