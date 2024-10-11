const StatusCodeEnum = require("../enums/StatusCodeEnum");
const UserEnum = require("../enums/UserEnum");
const CoreException = require("../exceptions/CoreException");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const { validFullName, validEmail } = require("../utils/validator");

module.exports = {
  getAllUsersService: async (page, size) => {
    const connection = new DatabaseTransaction();
    const users = await connection.userRepository.getAllUsersRepository(
      page,
      size
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

  deleteUserByIdService: async (userId, adminId) => {
    const connection = new DatabaseTransaction();
    try {
      const admin = await connection.userRepository.findUserById(adminId);
      if (!admin) {
        throw new CoreException(StatusCodeEnum.NotFound_404, "Admin not found");
      }
      if (admin.role !== UserEnum.ADMIN) {
        throw new CoreException(
          StatusCodeEnum.Forbidden_403,
          "You are not allowed to delete user"
        );
      }

      const user = await connection.userRepository.findUserById(userId);
      if (!user) {
        throw new CoreException(StatusCodeEnum.NotFound_404, "User not found");
      }
      if (user.role === UserEnum.ADMIN) {
        throw new CoreException(
          StatusCodeEnum.Forbidden_403,
          "You are not allowed to delete admin account"
        );
      }
      if (user.isDeleted === true) {
        throw new CoreException(
          StatusCodeEnum.NotFound_404,
          "User has been deleted"
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

      await validFullName(data.fullName);

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

      if (userId === followId) {
        throw new CoreException(
          StatusCodeEnum.BadRequest_400,
          "You can't follow yourself"
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

      if (userId === followId) {
        throw new CoreException(
          StatusCodeEnum.BadRequest_400,
          "You can't unfollow yourself"
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
