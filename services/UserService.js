const DatabaseTransaction = require("../repositories/DatabaseTransaction");

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
      throw new Error(`User ${userId} not found`);
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

  updateAnUserByIdService: async (userId, data) => {
    const connection = new DatabaseTransaction();

    try {
      const user = await connection.userRepository.updateAnUserByIdRepository(
        userId,
        data
      );
      return user;
    } catch (error) {
      throw new Error(`Error when update user by id: ${error.message}`);
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
