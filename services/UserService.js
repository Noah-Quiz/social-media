const StatusCodeEnum = require("../enums/StatusCodeEnum");
const UserEnum = require("../enums/UserEnum");
const CoreException = require("../exceptions/CoreException");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const { validFullName, validEmail } = require("../utils/validator");
const bcrypt = require("bcrypt");
module.exports = {
  getAllUsersService: async (page, size, name) => {
    const connection = new DatabaseTransaction();

    const users = await connection.userRepository.getAllUsersRepository(
      page,
      size,
      name
    );

    return users;
  },

  getUserByIdService: async (userId) => {
    try {
      const connection = new DatabaseTransaction();

      const user = await connection.userRepository.getAnUserByIdRepository(
        userId
      );

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
          "You are not allowed to delete admin account"
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

      await validEmail(email);

      const result = await connection.userRepository.updateAnUserByIdRepository(
        userId,
        { email, verify: false }
      );
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

  followUserService: async (userId, followId) => {
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

      const result = await connection.userRepository.followAnUserRepository(
        userId,
        followId
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

  unfollowUserService: async (userId, followId) => {
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

      const result = await connection.userRepository.unfollowAnUserRepository(
        userId,
        followId
      );
      if (!result) {
        throw new CoreException(
          StatusCodeEnum.Conflict_409,
          "Unfollow unsuccessfully"
        );
      }

      return result;
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
  updateUserWalletService: async (
    userId,
    actionCurrencyType,
    amount,
    exchangeRate
  ) => {
    let rate;
    if (!exchangeRate) {
      rate = 1000; //default
    } else {
      rate = parseFloat(exchangeRate);
    }

    try {
      const parseAmount = parseFloat(amount);
      if (parseFloat <= 0) {
        throw error("Invalid amount");
      }
      const connection = new DatabaseTransaction();
      const user = await connection.userRepository.updateUserWalletRepository(
        userId,
        actionCurrencyType,
        parseAmount,
        rate
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
};
