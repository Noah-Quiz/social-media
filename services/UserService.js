const StatusCodeEnum = require("../enums/StatusCodeEnum");
const UserEnum = require("../enums/UserEnum");
const CoreException = require("../exceptions/CoreException");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const {
  validFullName,
  validEmail,
  checkExistById,
} = require("../utils/validator");
const bcrypt = require("bcrypt");
const { sendVerificationEmailService } = require("./AuthService");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const { default: mongoose } = require("mongoose");
const User = require("../entities/UserEntity");
require("dotenv").config();

module.exports = {
  getAllUsersService: async (query, requesterId) => {
    const connection = new DatabaseTransaction();

    let requester = null;
    if (requesterId) {
      requester = await connection.userRepository.getAnUserByIdRepository(
        requesterId
      );
      if (!requester) {
        throw new CoreException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }
    }

    const data = await connection.userRepository.getAllUsersRepository(query);

    const { users } = data;

    data.users = users.map((user) => {
      if (
        user._id?.toString() !== requesterId?.toString() &&
        requester?.role !== UserEnum.ADMIN
      ) {
        delete user.email;
        delete user.phoneNumber;
      }

      return user;
    });

    return data;
  },

  getUserByIdService: async (userId, requesterId) => {
    try {
      const connection = new DatabaseTransaction();

      let user = await connection.userRepository.getAnUserByIdRepository(
        userId
      );
      if (!user) {
        throw new CoreException(StatusCodeEnum.NotFound_404, "User not found");
      }

      let requester = null;
      if (requesterId) {
        requester = await connection.userRepository.getAnUserByIdRepository(
          requesterId
        );
        if (!requester) {
          throw new CoreException(
            StatusCodeEnum.NotFound_404,
            "Requester not found"
          );
        }
      }

      const filteredUser = {
        _id: user._id,
        fullName: user.fullName,
        nickName: user.nickName,
        role: user.role,
        avatar: user.avatar,
        email: user.email,
        phoneNumber: user.phoneNumber,
        lastLogin: user.lastLogin,
        streak: user.streak,
        point: user.point,
        wallet: user.wallet,
        totalWatchTime: user.totalWatchTime,
        follow: user.follow,
        followBy: user.followBy,
        dateCreated: user.dateCreated,
        lastUpdated: user.lastUpdated,
      };
      filteredUser.followCount = user.follow?.length || 0;
      filteredUser.followerCount = user.followBy?.length || 0;

      if (
        user._id?.toString() !== requesterId?.toString() &&
        requester?.role !== UserEnum.ADMIN
      ) {
        delete filteredUser.follow;
        delete filteredUser.followBy;
        delete filteredUser.email;
        delete filteredUser.phoneNumber;
        delete filteredUser.wallet;
        delete filteredUser.streak;
        delete filteredUser.totalWatchTime;
      }

      return filteredUser;
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

      if (data.avatar !== null) {
        data.avatar = `${process.env.APP_BASE_URL}/${data.avatar}`;
      } else {
        delete data.avatar;
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
      if (
        action === "unfollow" &&
        !follow.followBy.some((f) => f.followById.equals(userId)) &&
        !user.follow.some((f) => f.followId.equals(followId))
      ) {
        throw new CoreException(
          StatusCodeEnum.BadRequest_400,
          "You are not following this user"
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
      const checkExistUser = await checkExistById(User, userId);
      if (!checkExistUser) {
        throw new CoreException(
          StatusCodeEnum.BadRequest_400,
          "Invalid user ID"
        );
      }
      if (watchTime <= 0) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "There's something wrong! Please try again"
        );
      }
      await connection.userRepository.updateTotalWatchTimeRepository(
        userId,
        watchTime
      );
      return;
    } catch (error) {
      throw error;
    }
  },
  getUserWalletService: async (userId, requester) => {
    try {
      const connection = new DatabaseTransaction();
      const caller = await connection.userRepository.getAnUserByIdRepository(
        requester
      );
      if (
        (caller === false || !caller || caller.role !== UserEnum.ADMIN) && //not admin
        requester?.toString() !== userId?.toString() //not owner
      ) {
        throw new CoreException(
          StatusCodeEnum.Forbidden_403,
          "Forbidden access"
        );
      }
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
      const user = await connection.userRepository.getAnUserByIdRepository(
        userId
      );

      if (user === false || !user) {
        throw new CoreException(StatusCodeEnum.NotFound_404, "User not found");
      }
      const stats = await connection.userRepository.getStatsByDateRepository(
        userId,
        fromDate,
        toDate
      );
      return stats;
    } catch (error) {
      throw error;
    }
  },

  async getFollowerService(userId, requester) {
    try {
      const connection = new DatabaseTransaction();

      const user = await connection.userRepository.getAnUserByIdRepository(
        userId
      );

      if (!user || user === false) {
        throw new CoreException(StatusCodeEnum.NotFound_404, "User not found");
      }
      const requesterRole = await connection.userRepository.findUserById(
        requester
      );

      if (
        requester.toString() !== userId.toString() &&
        requesterRole.role === UserEnum.USER
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

      const user = await connection.userRepository.getAnUserByIdRepository(
        userId
      );

      if (!user || user === false) {
        throw new CoreException(StatusCodeEnum.NotFound_404, "User not found");
      }
      const requesterRole = await connection.userRepository.findUserById(
        requester
      );
      if (
        requester.toString() !== userId.toString() &&
        requesterRole.role === UserEnum.USER
      ) {
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
  async updatePointService(userId, requesterId, amount, type) {
    try {
      const connection = new DatabaseTransaction();
      const checkUser = await connection.userRepository.getAnUserByIdRepository(
        userId
      );
      if (!checkUser || checkUser === false) {
        throw new CoreException(StatusCodeEnum.NotFound_404, "User not found");
      }
      const checkRequester =
        await connection.userRepository.getAnUserByIdRepository(requesterId);
      if (!checkRequester || checkRequester === false) {
        throw new CoreException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }
      //only admin can do this
      if (
        ["add", "remove"].includes(type) &&
        checkRequester?.role !== UserEnum.ADMIN
      ) {
        throw new CoreException(
          StatusCodeEnums.Forbidden_403,
          "You do not have permission to perform this action"
        );
      }
      if (
        type === "exchange" &&
        userId?.toString() !== requesterId?.toString()
      ) {
        throw new CoreException(
          StatusCodeEnums.Forbidden_403,
          "You can't exchange points for other people"
        );
      }
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

  async checkUserAuthorizationService(userId, requesterId) {
    try {
      const connection = new DatabaseTransaction();
      const user = await connection.userRepository.findUserById(userId);
      if (!user) {
        throw new CoreException(StatusCodeEnum.NotFound_404, "User not found");
      }
      if (requesterId !== userId && user.role !== UserEnum.ADMIN) {
        throw new CoreException(
          StatusCodeEnums.Forbidden_403,
          "You do not have permission to perform this action"
        );
      }
      return;
    } catch (error) {
      throw error;
    }
  },
};
