const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const UserEnum = require("../enums/UserEnum");

const createGiftHistoryService = async (streamId, userId, gifts) => {
  const connection = new DatabaseTransaction();
  const session = await connection.startTransaction();

  try {
    // Check if stream exists before proceeding
    const stream = await connection.streamRepository.getStreamRepository(
      streamId
    );
    if (!stream) {
      await connection.abortTransaction();
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Failed to create gift history: Stream not found"
      );
    }

    // Fetch all gifts information to get their pricePerUnit
    const giftDetails = await Promise.all(
      gifts.map(async (gift) => {
        const giftData = await connection.giftRepository.getGiftRepository(
          gift.giftId
        );
        if (!giftData) {
          throw new CoreException(
            StatusCodeEnums.NotFound_404,
            `Failed to create gift history: Gift with ID ${gift.giftId} not found.`
          );
        }
        return {
          ...gift,
          pricePerUnit: giftData.valuePerUnit,
          name: giftData.name,
          image: giftData.image,
        };
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
      await connection.abortTransaction();
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Failed to create gift history: Insufficient coins in the user's wallet."
      );
    }

    // Fetch exchange rate
    const rate =
      await connection.exchangeRateRepository.getAllRatesAsObjectRepository();

    // Create gift history
    const giftHistory =
      await connection.giftHistoryRepository.createGiftHistoryRepository(
        streamId,
        stream.title,
        stream.thumbnailUrl,
        userId,
        giftDetails
      );

    // Deduct coins from user's wallet
    await connection.userRepository.updateUserWalletRepository(
      userId,
      "SpendCoin",
      totalCost
    );

    // Transfer coins to stream owner
    await connection.userRepository.updateUserWalletRepository(
      stream.userId,
      "ReceiveCoin",
      totalCost * rate.ReceivePercentage // service fees when streamer receives gifts
    );

    // Commit transaction if all operations succeed
    const checkUser = await connection.userRepository.getAnUserByIdRepository(
      userId
    );
    if (!checkUser || checkUser === false) {
      await connection.abortTransaction();
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Failed to create gift history: User not found"
      );
    }

    if (checkUser.role === UserEnum.USER) {
      delete giftHistory.streamerTotal;
    }

    await connection.commitTransaction();
    return giftHistory;
  } catch (error) {
    await connection.abortTransaction(); // Rollback transaction on error
    throw error;
  }
};

const getGiftHistoryService = async (id, userId) => {
  const connection = new DatabaseTransaction();
  try {
    const checkUser = await connection.userRepository.getAnUserByIdRepository(
      userId
    );
    if (!checkUser || checkUser === false) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }

    const gift =
      await connection.giftHistoryRepository.getGiftHistoryRepository(id);
    if (!gift) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "No gift history found"
      );
    }
    if (checkUser.role === UserEnum.USER) {
      delete gift.streamerTotal;
    }
    return gift;
  } catch (error) {
    throw error;
  }
};
const getGiftHistoryByStreamIdService = async (streamId, userId) => {
  const connection = new DatabaseTransaction();
  try {
    const checkStream = await connection.streamRepository.getStreamRepository(
      streamId
    );
    if (!checkStream) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "No stream found");
    }
    const checkUser = await connection.userRepository.getAnUserByIdRepository(
      userId
    );
    if (!checkUser) {
      throw new CoreException("Invalid userId");
    }

    if (
      checkUser._id?.toString() !== checkStream?.userId?.toString() &&
      checkUser.role !== UserEnum.ADMIN
    ) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You do not have permission to perform this action"
      );
    }
    const giftHistories =
      await connection.giftHistoryRepository.getGiftHistoryByStreamIdRepository(
        streamId
      );
    if (!giftHistories || giftHistories.length === 0) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "No gift history found"
      );
    }
    return giftHistories;
  } catch (error) {
    throw error;
  }
};
const getGiftHistoryByUserIdService = async (userId) => {
  const connection = new DatabaseTransaction();
  try {
    const checkUser = await connection.userRepository.getAnUserByIdRepository(
      userId
    );
    if (!checkUser || checkUser === false) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }

    const giftHistories =
      await connection.giftHistoryRepository.getGiftHistoryByUserIdRepository(
        userId
      );

    if (!giftHistories || giftHistories.length === 0) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "No gift history found"
      );
    }
    if (checkUser.role === UserEnum.USER) {
      giftHistories.forEach((giftHistory) => {
        delete giftHistory.streamerTotal;
      });
    }
    return giftHistories;
  } catch (error) {
    throw error;
  }
};
const deleteGiftHistoryService = async (id, userId) => {
  const connection = new DatabaseTransaction();
  try {
    const Checkgift =
      await connection.giftHistoryRepository.getGiftHistoryRepository(id);
    console.log(Checkgift);
    if (!Checkgift || Checkgift.length === 0) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "No gift history found"
      );
    }
    const checkUser = await connection.userRepository.getAnUserByIdRepository(
      userId
    );
    if (
      !checkUser ||
      checkUser === false ||
      (Checkgift.userId?.toString() !== userId?.toString() &&
        checkUser.role !== UserEnum.ADMIN)
    ) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You do not have permission to perform this action"
      );
    }
    const giftHistory =
      await connection.giftHistoryRepository.deleteGiftHistoryRepository(id);
    return giftHistory;
  } catch (error) {
    throw error;
  }
};
module.exports = {
  createGiftHistoryService,
  getGiftHistoryService,
  getGiftHistoryByStreamIdService,
  getGiftHistoryByUserIdService,
  deleteGiftHistoryService,
};
