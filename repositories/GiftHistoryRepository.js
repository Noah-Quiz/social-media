const GiftHistory = require("../entities/GiftHistoryEntity");

class GiftHistoryRepository {
  async createGiftHistoryRepository(streamId, userId, gifts) {
    try {
      const existingHistory = await this.findExistingHistory(streamId, userId);

      if (existingHistory && existingHistory.length > 0) {
        const history = existingHistory[0]; // Get the existing record

        // Update existing  history with new gifts or new quantity
        gifts.forEach((newGift) => {
          const existingGiftIndex = history.gifts.findIndex(
            (g) => g.giftId.toString() === newGift.giftId.toString()
          );

          if (existingGiftIndex >= 0) {
            // Update quantity of existing gift
            history.gifts[existingGiftIndex].quantity += newGift.quantity;
          } else {
            // Add new gift
            history.gifts.push(newGift);
          }
        });

        // Update total
        history.total += gifts.reduce(
          (acc, gift) => acc + gift.quantity * gift.pricePerUnit,
          0
        );

        // Save the updated history
        return await history.save();
      } else {
        // Create new gift history if none exists
        const newGiftHistory = new GiftHistory({
          streamId,
          userId,
          gifts,
          total: gifts.reduce(
            (acc, gift) => acc + gift.quantity * gift.pricePerUnit,
            0
          ),
        });

        return await newGiftHistory.save();
      }
    } catch (error) {
      throw new Error(
        "Error creating or updating gift history: " + error.message
      );
    }
  }
  async findExistingHistory(streamId, userId) {
    try {
      const existingHistory = await GiftHistory.find({
        streamId: streamId,
        userId: userId,
        isDeleted: false,
      });
      return existingHistory;
    } catch (error) {
      throw new Error("Error finding existing history: ", error.message);
    }
  }
  async getGiftHistoryRepository(id) {
    try {
      const giftHistory = await GiftHistory.find({ _id: id, isDeleted: false });
      return giftHistory;
    } catch (error) {
      throw new Error("Error getting gift history:", error.message);
    }
  }
  async getGiftHistoryByStreamIdRepository(streamId) {
    try {
      const giftHistories = await GiftHistory.find({
        streamId: streamId,
        isDeleted: false,
      });
      return giftHistories;
    } catch (error) {
      throw new Error(
        "Error getting gift history by stream id:",
        error.message
      );
    }
  }
  async getGiftHistoryByUserIdRepository(userId) {
    try {
      const giftHistories = await GiftHistory.find({
        userId: userId,
        isDeleted: false,
      });
      return giftHistories;
    } catch (error) {
      throw new Error("Error getting gift history by user id:", error.message);
    }
  }
  async deleteGiftHistoryRepository(id) {
    try {
      const giftHistory = await GiftHistory.findByIdAndUpdate(id, {
        $set: { isDeleted: true },
      });
      return giftHistory;
    } catch (error) {
      throw new Error("Error deleting gift history:", error.message);
    }
  }
}

module.exports = GiftHistoryRepository;
