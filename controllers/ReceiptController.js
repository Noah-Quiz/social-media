const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const {
  deleteReceiptService,
  getAllUserReceiptService,
  getReceiptService,
} = require("../services/ReceiptService");

class ReceiptController {
  async getReceiptController(req, res, next) {
    const { id } = req.params;
    try {
      const receipt = await getReceiptService(id);
      if (!receipt) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Receipt not found"
        );
      }
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ receipt: receipt, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
  async getAllUserReceiptsController(req, res, next) {
    try {
      const userId = req.userId;
      const receipts = await getAllUserReceiptService(userId);
      return res.status(StatusCodeEnums.OK_200).json({
        receipts: receipts,
        size: receipts.length,
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  }
  async deleteReceiptController(req, res, next) {
    try {
      const { id } = req.params;
      const receipt = await deleteReceiptService(id);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ receipt: receipt, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = ReceiptController;
