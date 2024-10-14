const {
  createGiftHistoryService,
  deleteGiftHistoryService,
  getGiftHistoryByStreamIdService,
  getGiftHistoryByUserIdService,
  getGiftService,
} = require("../services/GiftHistoryService");

class GiftHistoryController {
  async createGiftHistoryController(req, res) {
    const { streamId, gifts } = req.body;
    const userId = req.userId;
    try {
      const giftHistory = await createGiftHistoryService(
        streamId,
        userId,
        gifts
      );
      return res
        .status(200)
        .json({ giftHistory: giftHistory, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async getGiftHistoryByStreamIdController(req, res) {
    const { streamId } = req.params;
    try {
      const giftHistory = await getGiftHistoryByStreamIdService(streamId);
      return res
        .status(200)
        .json({ giftHistory: giftHistory, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async getGiftHistoryByUserIdController(req, res) {
    const userId = req.userId;
    try {
      const giftHistory = await getGiftHistoryByUserIdService(userId);
      return res
        .status(200)
        .json({ giftHistory: giftHistory, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async getGiftController(req, res) {
    const { id } = req.params;
    try {
      const gift = await getGiftService(id);
      return res.status(200).json({ gift: gift, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async deleteGiftHistoryController(req, res) {
    const { id } = req.params;
    try {
      const giftHistory = await deleteGiftHistoryService(id);
      return res
        .status(200)
        .json({ giftHistory: giftHistory, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}
module.exports = GiftHistoryController;
