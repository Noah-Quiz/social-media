const Gift = require("../entities/GiftEntity");

class GiftRepository {
  async createGiftRepository(giftData) {
    try {
      const gift = await Gift.create(giftData);
      return gift;
    } catch (error) {
      throw new Error(`Error creating gift: ${error.message}`);
    }
  }

  async getGiftRepository(id) {
    try {
      const gift = await Gift.findOne({ _id: id, isDeleted: false });
      return gift;
    } catch (error) {
      throw new Error(`Error getting gift: ${error.message}`);
    }
  }

  async getAllGiftRepository() {
    try {
      const gifts = await Gift.find({ isDeleted: false });
      return gifts;
    } catch (error) {
      throw new Error(`Error getting all gifts: ${error.message}`);
    }
  }

  async updateGiftRepository(id, name, image, price) {
    try {
      // Fetch the gift by ID
      const gift = await this.getGiftRepository(id);

      if (!gift) {
        throw new Error("Gift not found");
      }

      // Update fields only if they are provided and valid
      if (name && name !== "") {
        gift.name = name;
      }
      if (image && image !== "") {
        gift.image = image;
      }
      if (price && price > 0 && price !== gift.price) {
        gift.valuePerUnit = price;
      }

      // Save the updated gift
      await gift.save();
      return gift;
    } catch (error) {
      throw new Error(`Error updating gift: ${error.message}`);
    }
  }

  async deleteGiftRepository(id) {
    try {
      const gift = await Gift.findOneAndUpdate(
        { _id: id },
        { $set: { isDeleted: true } },
        { new: true } // Return the updated document
      );
      return gift;
    } catch (error) {
      throw new Error(`Error deleting gift: ${error.message}`);
    }
  }
}

module.exports = GiftRepository;
