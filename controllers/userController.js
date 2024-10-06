const {
  followAnUserService,
  unfollowAnUserService,
  createAnUserService,
} = require("../services/UserService");
const mongoose = require("mongoose");

module.exports = {
  createAnUser: async (req, res) => {
    const result = await createAnUserService(req.body);
    return res.status(200).json(result);
  },
  followAnUser: async (req, res) => {
    const { userId, followId } = req.query;
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(followId)
    ) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const result = await followAnUserService(userId, followId);
    if (result.EC === 1) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  },

  unfollowAnUser: async (req, res) => {
    const { userId, followId } = req.query;
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(followId)
    ) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const result = await unfollowAnUserService(userId, followId);
    if (result.EC === 1) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  },
};
