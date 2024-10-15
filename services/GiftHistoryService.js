const DatabaseTransaction = require("../repositories/DatabaseTransaction");

const createGiftHistoryService = async (streamId, userId, gifts) => {
  const connection = new DatabaseTransaction();
  const session = await connection.startTransaction();

  try {
    // Fetch all gifts information to get their pricePerUnit
    const giftDetails = await Promise.all(
      gifts.map(async (gift) => {
        const giftData = await connection.giftRepository.getGiftRepository(
          gift.giftId
        );
        if (!giftData) {
          throw new Error(`Gift with ID ${gift.giftId} not found.`);
        }
        return { ...gift, pricePerUnit: giftData.valuePerUnit };
      })
    );

    // Calculate the total cost based on fetched gift details
    const totalCost = giftDetails.reduce(
      (acc, gift) => acc + gift.quantity * gift.pricePerUnit,
      0
    );

    // Check user's wallet balance
    const userWallet = await connection.userRepository.getUserWallet(userId);
    if (userWallet.coin < totalCost) {
      throw new Error("Insufficient coins in the user's wallet.");
    }

    // Create gift history in the repository
    const giftHistory =
      await connection.giftHistoryRepository.createGiftHistoryRepository(
        streamId,
        userId,
        giftDetails
      );

    // Deduct coins from user's wallet after successful gift history creation
    await connection.userRepository.updateUserWalletRepository(
      userId,
      "SpendCoin",
      totalCost
    );
    const stream = await connection.streamRepository.getStreamRepository(
      streamId
    );
    await connection.userRepository.updateUserWalletRepository(
      stream.userId,
      "ReceiveCoin",
      totalCost
    );
    await connection.commitTransaction(); // Commit transaction if all operations succeed
    return giftHistory;
  } catch (error) {
    await connection.abortTransaction(); // Rollback transaction on error
    throw new Error(`Failed to create gift history: ${error.message}`);
  }
};

const getGiftService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const gift =
      await connection.giftHistoryRepository.getGiftHistoryRepository(id);
    return gift;
  } catch (error) {
    throw new Error(error.message);
  }
};
const getGiftHistoryByStreamIdService = async (streamId) => {
  const connection = new DatabaseTransaction();
  try {
    const giftHistories =
      await connection.giftHistoryRepository.getGiftHistoryByStreamIdRepository(
        streamId
      );
    return giftHistories;
  } catch (error) {
    throw new Error(error.message);
  }
};
const getGiftHistoryByUserIdService = async (userId) => {
  const connection = new DatabaseTransaction();
  try {
    const giftHistories =
      await connection.giftHistoryRepository.getGiftHistoryByUserIdRepository(
        userId
      );
    return giftHistories;
  } catch (error) {
    throw new Error(error.message);
  }
};
const deleteGiftHistoryService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const giftHistory =
      await connection.giftHistoryRepository.deleteGiftHistoryRepository(id);
    return giftHistory;
  } catch (error) {
    throw new Error(error.message);
  }
};
module.exports = {
  createGiftHistoryService,
  getGiftService,
  getGiftHistoryByStreamIdService,
  getGiftHistoryByUserIdService,
  deleteGiftHistoryService,
};
