const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const {
  followUserService,
  unfollowUserService,
  getAllUsersService,
  getUserByIdService,
  updateUserProfileByIdService,
  updateUserEmailByIdService,
  deleteUserByIdService,
} = require("../services/UserService");
const mongoose = require("mongoose");

class UserController {
  async getAllUsersController(req, res) {
    try {
      const { page, size, name } = req.query;

      const result = await getAllUsersService(page || 1, size || 10, name || '');

      return res.status(StatusCodeEnums.OK_200).json(result);
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
      }
    }
  }

  async deleteUserByIdController(req, res) {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(StatusCodeEnums.InternalServerError_500)
        .json({ message: "Valid user ID is required" });
    }
    try {
      const result = await deleteUserByIdService(userId);

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
      }
    }
  }

  async getUserByIdController(req, res) {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Valid user ID is required" });
    }
    try {
      const result = await getUserByIdService(userId);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ user: result, message: "Get user successfully" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
      }
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
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Invalid user ID" });
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
        return res.status(error.code).json({ message: error.message });
      } else {
        return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
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
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Invalid user ID" });
    }

    try {
      const result = await updateUserEmailByIdService(userId, email);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ user: result, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
      }
    }
  }

  async toggleFollowController(req, res) {
    const { userId, followId, action } = req.body;

    if (!["follow", "unfollow"].includes(action)) {
      return res
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Invalid action" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Invalid userId" });
    }
    if (!mongoose.Types.ObjectId.isValid(followId)) {
      return res
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Invalid followId" });
    }

    let result;
    try {
      if (action === "follow") {
        result = await followUserService(userId, followId);
      } else if (action === "unfollow") {
        result = await unfollowUserService(userId, followId);
      }

      return res.status(StatusCodeEnums.OK_200).json({
        message: `${action.charAt(0).toUpperCase() + action.slice(1)} success`,
      });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
      }
    }
  }
}

module.exports = UserController;
