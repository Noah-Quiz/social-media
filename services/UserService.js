const { verify } = require("jsonwebtoken");
const StatusCodeEnum = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const { sendVerificationEmailService } = require("./AuthService");

module.exports = {
  getAllUsersService: async () => {
    const connection = new DatabaseTransaction();
    const users = await connection.userRepository.getAllUsersRepository();
    return users;
  },

  getAnUserByIdService: async (userId) => {
    const connection = new DatabaseTransaction();
    const user = await connection.userRepository.getAnUserByIdRepository(
      userId
    );
    if (!user) {
      throw new Error(`User not found`);
    }
    return user;
  },

  deleteAnUserByIdService: async (userId) => {
    const connection = new DatabaseTransaction();
    try {
      const user = await connection.userRepository.deleteAnUserByIdRepository(
        userId
      );
      if (user)
        return {
          message: `Delete user ${userId} successfully`,
        };
    } catch (error) {
      throw new Error(`Error when delete an user by id: ${error.message}`);
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

      const result = await connection.userRepository.updateAnUserByIdRepository(
        userId,
        { email, verify: false }
      );
      return result;
    } catch (error) {
      throw error;
    }
  },

  followAnUserService: async (userId, followId) => {
    const connection = new DatabaseTransaction();
    const result = await connection.userRepository.followAnUserRepository(
      userId,
      followId
    );
    if (result) {
      return {
        EC: 0,
        message: "Follow successfully",
      };
    }
    return {
      EC: 1,
      message: "Follow unsuccessfully",
    };
  },

  unfollowAnUserService: async (userId, followId) => {
    const connection = new DatabaseTransaction();
    const result = await connection.userRepository.unfollowAnUserRepository(
      userId,
      followId
    );
    if (result) {
      return {
        EC: 0,
        message: "Unfollow successfully",
      };
    }
    return {
      EC: 1,
      message: "Unfollow unsuccessfully",
    };
  },
};
