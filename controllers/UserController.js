const {
  followAnUserService,
  unfollowAnUserService,
  getAllUsersService,
  getAnUserByIdService,
  updateAnUserByIdService,
  deleteAnUserByIdService,
} = require("../services/UserService");
const mongoose = require("mongoose");

class UserController {
  async getAllUsersController(req, res) {
    try {
      const result = await getAllUsersService();

      return res.status(200).json({ user: result });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async deleteAnUserByIdController(req, res) {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(500).json({ message: "UserId is not an ObjectId" });
    }
    try {
      const result = await deleteAnUserByIdService(userId);

      return res.status(200).json({ message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getAnUserByIdController(req, res) {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(500).json({ message: "UserId is not an ObjectId" });
    }
    try {
      const result = await getAnUserByIdService(userId);
      return res.status(200).json({ user: result });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async updateAnUserByIdController(req, res) {
    const { userId } = req.params;
    const data = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(500).json({ message: "UserId is not an ObjectId" });
    }

    try {
      const result = await updateAnUserByIdService(userId, data);
      return res.status(200).json({ user: result });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async followAnUserController(req, res) {
    const { userId, followId } = req.query;
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(followId)
    ) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const result = await followAnUserService(userId, followId);
    if (result.EC === 1) {
      return res.status(400).json({ message: "Failed to follow" });
    }
    return res.status(200).json({ message: "Follow success" });
  }

  async unfollowAnUserController(req, res) {
    const { userId, followId } = req.query;
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(followId)
    ) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const result = await unfollowAnUserService(userId, followId);
    if (result.EC === 1) {
      return res.status(400).json({ message: "Failed to unfollow" });
    }
    return res.status(200).json({ message: "Unfollow success" });
  }
}

module.exports = UserController;
