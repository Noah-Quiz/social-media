const DatabaseTransaction = require("../repositories/DatabaseTransaction");

module.exports = {
  createAnUserService: async (data) => {
    const connection = new DatabaseTransaction();
    const user = await connection.UserRepository.createUser(data);
    if (!user) {
      return {
        EC: 1,
        message: "Create an user unsuccessfully",
      };
    }
    return user;
  },

  followAnUserService: async (userId, followId) => {
    const connection = new DatabaseTransaction();
    const result = connection.UserRepository.followAUser(userId, followId);
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
    const result = connection.UserRepository.unfollowAnUser(userId, followId);
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
