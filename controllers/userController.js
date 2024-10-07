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
    const result = await getAllUsersService();
    return res.status(200).json(result);
  }

  async deleteAnUserByIdController(req, res) {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(500).json({ error: "UserId is not an ObjectId" });
    }
    try {
      const result = await deleteAnUserByIdService(userId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getAnUserByIdController(req, res) {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(500).json({ error: "UserId is not an ObjectId" });
    }
    try {
      const result = await getAnUserByIdService(userId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  async updateAnUserByIdController(req, res) {
    const { userId } = req.params;
    const data = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(500).json({ error: "UserId is not an ObjectId" });
    }

    try {
      const result = await updateAnUserByIdService(userId, data);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
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
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
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
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  }
}

module.exports = UserController;
