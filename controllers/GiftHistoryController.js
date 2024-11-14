const CreateGiftHistoryDto = require("../dtos/GiftHistory/CreateGiftHistoryDto");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const {
  createGiftHistoryService,
  deleteGiftHistoryService,
  getGiftHistoryByStreamIdService,
  getGiftHistoryByUserIdService,
  getGiftService,
} = require("../services/GiftHistoryService");

class GiftHistoryController {
  async createGiftHistoryController(req, res, next) {
    const { streamId, gifts } = req.body;
    const userId = req.userId;
    console.log(userId);
    try {
      const createGiftHistoryDto = new CreateGiftHistoryDto(streamId, gifts);
      await createGiftHistoryDto.validate();
      const giftHistory = await createGiftHistoryService(
        streamId,
        userId,
        gifts
      );
      return res
        .status(StatusCodeEnums.Created_201)
        .json({ giftHistory: giftHistory, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
  async getGiftHistoryByStreamIdController(req, res, next) {
    const { streamId } = req.params;
    const userId = req.userId;
    try {
      const giftHistory = await getGiftHistoryByStreamIdService(
        streamId,
        userId
      );
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ giftHistory: giftHistory, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
  async getGiftHistoryByUserIdController(req, res, next) {
    const userId = req.userId;
    try {
      const giftHistory = await getGiftHistoryByUserIdService(userId);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ giftHistory: giftHistory, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
  async getGiftController(req, res, next) {
    const { id } = req.params;
    try {
      const gift = await getGiftService(id);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ gift: gift, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
  async deleteGiftHistoryController(req, res, next) {
    const { id } = req.params;
    const userId = req.userId;
    try {
      const giftHistory = await deleteGiftHistoryService(id, userId);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ giftHistory: giftHistory, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = GiftHistoryController;
