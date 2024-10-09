const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const {
  followAnUserService,
  unfollowAnUserService,
  getAllUsersService,
  getAnUserByIdService,
  updateUserProfileByIdService,
  updateUserEmailByIdService,
  deleteAnUserByIdService,
} = require("../services/UserService");
const mongoose = require("mongoose");

class UserController {
  async getAllUsersController(req, res) {
    try {
      const result = await getAllUsersService();

      return res.status(200).json({ user: result, message: "Success" });
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
      return res.status(200).json({ user: result, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async updateUserProfileByIdController(req, res) {
    const { userId } = req.params;
    const { fullName, nickName, avatar } = req.body;

    if (req.userId !== userId) {
      return res
        .status(StatusCodeEnums.Forbidden_403)
        .json({ message: "Forbidden access" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(StatusCodeEnums.InternalServerError_500)
        .json({ message: "UserId is not an ObjectId" });
    }

    try {
      const result = await updateUserProfileByIdService(userId, {
        fullName,
        nickName,
        avatar,
      });
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ user: result, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async updateUserEmailByIdController(req, res) {
    const { userId } = req.params;
    const { email } = req.body;

    if (req.userId !== userId) {
      return res
        .status(StatusCodeEnums.Forbidden_403)
        .json({ message: "Forbidden access" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(StatusCodeEnums.InternalServerError_500)
        .json({ message: "UserId is not an ObjectId" });
    }

    try {
      const result = await updateUserEmailByIdService(userId, email);
      res
        .status(StatusCodeEnums.OK_200)
        .json({ user: result, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async toggleFollowController(req, res) {
    const { userId, followId, action } = req.query;
    console.log(req.query);

    if (!["follow", "unfollow"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(followId)
    ) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    let result;
    try {
      if (action === "follow") {
        result = await followAnUserService(userId, followId);
      } else if (action === "unfollow") {
        result = await unfollowAnUserService(userId, followId);
      }

      if (result.EC === 1) {
        return res.status(400).json({ message: `Failed to ${action}` });
      }

      return res.status(200).json({
        message: `${action.charAt(0).toUpperCase() + action.slice(1)} success`,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Error during ${action}: ${error.message}` });
    }
  }
}

module.exports = UserController;
