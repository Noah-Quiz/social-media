const {
  deleteReceiptService,
  getAllUserReceiptService,
  getReceiptService,
} = require("../services/ReceiptService");

class ReceiptController {
  async getReceiptController(req, res) {
    const { id } = req.params;
    try {
      const receipt = await getReceiptService(id);
      if (!receipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      return res.status(200).json({ receipt: receipt, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async getAllUserReceiptsController(req, res) {
    try {
      const userId = req.userId;
      const receipts = await getAllUserReceiptService(userId);
      return res.status(200).json({
        receipts: receipts,
        size: receipts.length,
        message: "Success",
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async deleteReceiptController(req, res) {
    try {
      const { id } = req.params;
      const receipt = await deleteReceiptService(id);
      return res.status(200).json({ receipt: receipt, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}
module.exports = ReceiptController;
