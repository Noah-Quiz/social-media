const { isFloat } = require("validator");
const {
  createGiftService,
  deleteGiftService,
  getAllGiftService,
  getGiftService,
  updateGiftService,
} = require("../services/GiftService");
const CreateGiftDto = require("../dtos/Gift/CreateGiftDto");
const UpdateGiftDto = require("../dtos/Gift/UpdateGiftDto");
const StatusCodeEnums = require("../enums/StatusCodeEnum");

class GiftController {
  async createGiftController(req, res, next) {
    try {
      const { name, image, valuePerUnit } = req.body;
      const createGiftDto = new CreateGiftDto(name, image, valuePerUnit);
      await createGiftDto.validate();

      const gift = await createGiftService(name, image, valuePerUnit);
      return res
        .status(StatusCodeEnums.Created_201)
        .json({ gift: gift, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async updateGiftController(req, res, next) {
    try {
      const { id } = req.params;
      const { name, image, valuePerUnit } = req.body;
      const updateGiftDto = new UpdateGiftDto(id, name, image, valuePerUnit);
      await updateGiftDto.validate();

      const gift = await updateGiftService(
        id,
        name || "",
        image || "",
        valuePerUnit || 0
      );
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ gift: gift, message: "Update success" });
    } catch (error) {
      next(error);
    }
  }

  async getGiftController(req, res, next) {
    const { id } = req.params;

    try {
      const gift = await getGiftService(id);
      if (!gift) {
        throw new CoreException(StatusCodeEnums.NotFound_404, "Gift not found");
      }
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ gift: gift, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async getAllGiftController(req, res, next) {
    try {
      const gifts = await getAllGiftService();
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ gifts: gifts, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async deleteGiftController(req, res, next) {
    const { id } = req.params;

    try {
      if (!id) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "ID is required"
        );
      }

      const gift = await deleteGiftService(id);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Deletion success" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GiftController;
