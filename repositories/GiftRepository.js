const Gift = require("../entities/GiftEntity");

class GiftRepository {
  async createGiftRepository(giftData) {
    try {
      const gift = await Gift.create(giftData);
      const result = gift.toObject();

      // Remove unwanted fields
      delete result.__v;
      delete result.lastUpdated;
      delete result.isDeleted;

      return result;
    } catch (error) {
      throw new Error(`Error creating gift: ${error.message}`);
    }
  }
  async getGiftByNameRepository(name) {
    try {
      const gift = await Gift.findOne({ name: name, isDeleted: false });
      return gift;
    } catch (error) {
      throw new Error(`Error getting gift by name: ${error.message}`);
    }
  }

  async getGiftRepository(id) {
    try {
      const gift = await Gift.findOne({ _id: id, isDeleted: false });
      if (!gift) {
        return null;
      }

      const result = gift.toObject();

      // Remove unwanted fields
      delete result.__v;
      delete result.lastUpdated;
      delete result.isDeleted;

      return result;
    } catch (error) {
      throw new Error(`Error getting gift: ${error.message}`);
    }
  }

  async getAllGiftRepository() {
    try {
      let gifts = await Gift.find({ isDeleted: false })
        .sort({ valuePerUnit: 1 })
        .lean();

      // Remove unwanted fields from each gift
      gifts = gifts.map((gift) => {
        delete gift.__v;
        delete gift.lastUpdated;
        delete gift.isDeleted;
        return gift;
      });

      return gifts;
    } catch (error) {
      throw new Error(`Error getting all gifts: ${error.message}`);
    }
  }

  async updateGiftRepository(id, name, image, price) {
    try {
      // Fetch the gift by ID
      const gift = await Gift.findById(id);
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
      const updatedGift = await gift.save();
      const result = updatedGift.toObject();

      // Remove unwanted fields
      delete result.__v;
      delete result.lastUpdated;
      delete result.isDeleted;

      return result;
    } catch (error) {
      throw new Error(`Error updating gift: ${error.message}`);
    }
  }

  async deleteGiftRepository(id) {
    try {
      const gift = await Gift.findOneAndUpdate(
        { _id: id },
        {
          $set: { isDeleted: true, lastUpdated: new Date() },
        },
        { new: true }
      );
      if (!gift) {
        return null;
      }

      const result = gift.toObject();

      // Remove unwanted fields
      delete result.__v;
      delete result.lastUpdated;

      return result;
    } catch (error) {
      throw new Error(`Error deleting gift: ${error.message}`);
    }
  }
}

module.exports = GiftRepository;
