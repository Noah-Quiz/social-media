const { isFloat } = require("validator");
const {
  createGiftService,
  deleteGiftService,
  getAllGiftService,
  getGiftService,
  updateGiftService,
} = require("../services/GiftService");

class GiftController {
  async createGiftController(req, res) {
    const { name, image, valuePerUnit } = req.body;
    if (!name || !image || !valuePerUnit) {
      return res
        .status(400)
        .json({ message: "Please fill in all fields: name, image, price" });
    }

    // Use validator's isFloat method correctly
    if (!isFloat(valuePerUnit.toString())) {
      return res.status(400).json({ message: "Invalid price format" });
    }

    try {
      const gift = await createGiftService(name, image, valuePerUnit);
      return res.status(200).json({ gift: gift, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async updateGiftController(req, res) {
    const { id } = req.params;
    const { name, image, valuePerUnit } = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    if (valuePerUnit && !isFloat(valuePerUnit.toString())) {
      return res.status(400).json({ message: "Invalid price format" });
    }

    try {
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
