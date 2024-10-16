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

class GiftController {
  async createGiftController(req, res) {
    try {
      const { name, image, valuePerUnit } = req.body;
      const createGiftDto = new CreateGiftDto(name, image, valuePerUnit);
      await createGiftDto.validate();

      const gift = await createGiftService(name, image, valuePerUnit);
      return res.status(200).json({ gift: gift, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async updateGiftController(req, res) {
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
      return res.status(200).json({ gift: gift, message: "Update success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getGiftController(req, res) {
    const { id } = req.params;

    try {
      const gift = await getGiftService(id);
      if (!gift) {
        return res.status(404).json({ message: "Gift not found" });
      }
      return res.status(200).json({ gift: gift, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getAllGiftController(req, res) {
    try {
      const gifts = await getAllGiftService();
      return res.status(200).json({ gifts: gifts, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async deleteGiftController(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    try {
      const gift = await deleteGiftService(id);
      return res.status(200).json({ gift: gift, message: "Deletion success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = GiftController;
