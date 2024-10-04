const {
  followAUserService,
  unfollowAUserService,
} = require("../service/userService");
const mongoose = require("mongoose");

module.exports = {
  followAUser: async (req, res) => {
    const { userId, followId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(followId)
    ) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const result = await followAUserService(userId, followId);
    if (result.EC === 1) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  },

  unfollowAUser: async (req, res) => {
    const { userId, followId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(followId)
    ) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const result = await unfollowAUserService(userId, followId);
    if (result.EC === 1) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  },
};
