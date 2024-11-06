const StatusCodeEnum = require("../enums/StatusCodeEnum");
const UserEnum = require("../enums/UserEnum");
const CoreException = require("../exceptions/CoreException");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const { validFullName, validEmail } = require("../utils/validator");
const bcrypt = require("bcrypt");
const { sendVerificationEmailService } = require("./AuthService");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
module.exports = {
  getAllUsersService: async (query) => {
    const connection = new DatabaseTransaction();

    const data = await connection.userRepository.getAllUsersRepository(query);

    return data;
  },

  getUserByIdService: async (userId, requester) => {
    try {
      const connection = new DatabaseTransaction();

      let user = await connection.userRepository.getAnUserByIdRepository(
        userId
      );
      const caller = await connection.userRepository.getAnUserByIdRepository(
        requester
      );
      console.log("My own: ", userId?.toString() === requester?.toString());
      if (userId?.toString() === requester?.toString()) {
        if (caller.role != 1) {
        }
      } else {
        user = { ...user };

        console.log("isAdmin:", caller.role === 1);

        //not admin
        if (caller.role !== 1) {
          user.followCount = user?.follow ? user.follow.length : 0;
          user.followerCount = user?.followBy ? user.followBy.length : 0;
          delete user.follow;
          delete user.followBy;
          delete user.role;
        }
      }

      if (!user) {
        throw new CoreException(StatusCodeEnum.NotFound_404, "User not found");
      }

      return user;
    } catch (error) {
      throw error;
    }
  },

  deleteUserByIdService: async (userId) => {
    try {
      const connection = new DatabaseTransaction();

      const user = await connection.userRepository.findUserById(userId);

      if (!user || user.isDeleted === true) {
        throw new CoreException(StatusCodeEnum.NotFound_404, "User not found");
      }

      if (user.role === UserEnum.ADMIN) {
        throw new CoreException(
          StatusCodeEnum.Forbidden_403,
          "You do not have permission to perform this action"
        );
      }

      const result = await connection.userRepository.deleteAnUserByIdRepository(
        userId
      );

      if (result)
        return {
          message: `Delete user ${userId} successfully`,
        };
    } catch (error) {
      throw error;
    }
  },

  updateUserProfileByIdService: async (userId, data) => {
    try {
      const connection = new DatabaseTransaction();

      const user = await connection.userRepository.findUserById(userId);

      if (!user) {
        throw new CoreException(StatusCodeEnum.NotFound_404, "User not found");
      }

      const result = await connection.userRepository.updateAnUserByIdRepository(
        userId,
        data
      );
      return result;
    } catch (error) {
      throw error;
    }
  },

  updateUserEmailByIdService: async (userId, email) => {
    try {
      const connection = new DatabaseTransaction();
      const existingUser = await connection.userRepository.findUserByEmail(
        email
      );
      if (existingUser) {
        throw new CoreException(
          StatusCodeEnum.Conflict_409,
          "Email is already in use !"
        );
      }
      const user = await connection.userRepository.findUserById(userId);
      if (!user) {
        throw new CoreException(StatusCodeEnum.NotFound_404, "User not found");
      }
      if (user.email === email) {
        throw new CoreException(
          StatusCodeEnum.Conflict_409,
          "Email is the same as the current email"
        );
      }

      const result = await connection.userRepository.updateAnUserByIdRepository(
        userId,
        { email, verify: false }
      );

      await sendVerificationEmailService(email);
      return result;
    } catch (error) {
      throw error;
    }
  },
  updateUserPasswordByIdService: async (userId, data) => {
    try {
      const connection = new DatabaseTransaction();

      const user = await connection.userRepository.findUserById(userId);
      if (!user) {
        throw new CoreException(StatusCodeEnum.NotFound_404, "User not found");
      }

      const isMatch = bcrypt.compare(data.oldPassword, user.password);
      if (!isMatch) {
        throw new CoreException(
          StatusCodeEnum.BadRequest_400,
          "Old password is incorrect"
        );
      }

      const salt = 10;
      const hashedNewPassword = await bcrypt.hash(data.newPassword, salt);

      const result = await connection.userRepository.updateAnUserByIdRepository(
        userId,
        { password: hashedNewPassword }
      );
      return result;
    } catch (error) {
      throw error;
    }
  },

  toggleFollowUserService: async (userId, followId, action) => {
    try {
      const connection = new DatabaseTransaction();

      const user = await connection.userRepository.findUserById(userId);
      if (!user) {
        throw new CoreException(StatusCodeEnum.NotFound_404, "User not found");
      }

      const follow = await connection.userRepository.findUserById(followId);
      if (!follow) {
        throw new CoreException(
          StatusCodeEnum.NotFound_404,
          "User to follow not found"
        );
      }

      const result =
        await connection.userRepository.toggleFollowAnUserRepository(
          userId,
          followId,
          action
        );
      if (!result) {
        throw new CoreException(
          StatusCodeEnum.Conflict_409,
          "Follow unsuccessfully"
        );
      }
      console.log(result);

      const notification = {
        avatar: user.avatar,
        content: `${user.fullName} đang follow bạn`,
        check: user,
        seen: false,
        createdAt: new Date(),
      };

      await connection.userRepository.notifiCommentRepository(userId, followId);

      return result;
    } catch (error) {
      throw error;
    }
  },

  updateTotalWatchTimeService: async (userId, watchTime) => {
    const connection = new DatabaseTransaction();
    try {
      await connection.userRepository.updateTotalWatchTimeRepository(
        userId,
        watchTime
      );
      return;
    } catch (error) {
      throw error;
    }
  },
  getUserWalletService: async (userId) => {
    try {
      const connection = new DatabaseTransaction();
      const user = await connection.userRepository.getUserWallet(userId);
      return user;
    } catch (error) {
      throw error;
    }
  },
  updateUserWalletService: async (userId, actionCurrencyType, amount) => {
    let exchangeRate;
    const connection = new DatabaseTransaction();
    if (actionCurrencyType === "ExchangeBalanceToCoin") {
      const Rates =
        await connection.exchangeRateRepository.getAllRatesAsObjectRepository();
      exchangeRate = Rates.exchangeRateBalanceToCoin;
    }
    if (actionCurrencyType === "ExchangeCoinToBalance") {
      const Rates =
        await connection.exchangeRateRepository.getAllRatesAsObjectRepository();
      exchangeRate = Rates.exchangeRateCoinToBalance;
    }
    try {
      const parseAmount = parseFloat(amount);
      if (parseFloat <= 0) {
        throw error("Invalid amount");
      }

      const user = await connection.userRepository.updateUserWalletRepository(
        userId,
        actionCurrencyType,
        parseAmount,
        exchangeRate
      );
      if (!user) {
        throw new CoreException(
          StatusCodeEnum.NotFound_404,
          "User not found or update failed"
        );
      }
      return user;
    } catch (error) {
      throw error;
    }
  },
  async topUpUserService(userId, amount) {
    try {
      const connection = new DatabaseTransaction();
      const rate =
        await connection.exchangeRateRepository.getAllRatesAsObjectRepository();
      const user = await connection.userRepository.topUpUserBalance(
        userId,
        amount * rate.topUpBalanceRate
      );
      return user;
    } catch (error) {
      throw error;
    }
  },

  getStatsByDateService: async (userId, fromDate, toDate) => {
    try {
      const connection = new DatabaseTransaction();
      const stats = await connection.userRepository.getStatsByDateRepository(
        userId,
        fromDate,
        toDate
      );
      return stats;
    } catch (error) {}
  },

  async getFollowerService(userId, requester) {
    try {
      const connection = new DatabaseTransaction();

      const requesterRole = await connection.userRepository.findUserById(
        requester
      );

      if (
        requester.toString() !== userId.toString() &&
        requesterRole.role === 0
      ) {
        throw new CoreException(
          StatusCodeEnums.Forbidden_403,
          "You do not have permission to perform this action"
        );
      }

      const follower = await connection.userRepository.getFollowerRepository(
        userId
      );

      return follower;
    } catch (error) {
      throw error;
    }
  },

  async getFollowingService(userId, requester) {
    try {
      const connection = new DatabaseTransaction();

      if (requester.toString() !== userId.toString()) {
        throw new CoreException(
          StatusCodeEnums.Forbidden_403,
          "You do not have permission to perform this action"
        );
      }

      const following = await connection.userRepository.getFollowingRepository(
        userId
      );

      return following;
    } catch (error) {
      throw error;
    }
  },
  async updatePointService(userId, amount, type) {
    try {
      const connection = new DatabaseTransaction();
      const user = await connection.userRepository.updateUserPointRepository(
        userId,
        amount,
        type
      );
      return user;
    } catch (error) {
      throw error;
    }
  },
};
