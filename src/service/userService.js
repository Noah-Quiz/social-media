const userModel = require("../model/userModel");
const {
  followAUserRepository,
  unfollowAUserRepository,
} = require("../repository/userRepository");

module.exports = {
  followAUserService: async (userId, followId) => {
    const result = await followAUserRepository(userId, followId);
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

  unfollowAUserService: async (userId, followId) => {
    const result = await unfollowAUserRepository(userId, followId);
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
