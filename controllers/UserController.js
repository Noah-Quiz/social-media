const ToggleFollowDto = require("../dtos/User/ToggleFollowDto");
const UpdateUserProfileDto = require("../dtos/User/UpdateUserProfileDto");
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
  updateUserPasswordByIdService,
  getUserWalletService,
  updateUserWalletService,
} = require("../services/UserService");
const mongoose = require("mongoose");
const { deleteFile, checkFileSuccess } = require("../utils/stores/storeImage");
const UpdateUserPasswordDto = require("../dtos/User/UpdateUserPasswordDto");
const UpdateUserEmailDto = require("../dtos/User/UpdateUserEmailDto");

class UserController {
  async getAllUsersController(req, res) {
    try {
      const { page, size, name } = req.query;

      const result = await getAllUsersService(
        page || 1,
        size || 10,
        name || ""
      );

      return res.status(StatusCodeEnums.OK_200).json(result);
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
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
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
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
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }
  async updateUserProfileByIdController(req, res) {
    try {
      const { userId } = req.params;
      const { fullName, nickName } = req.body;
      let avatar = req.file ? req.file.path : null;
      const updateUserProfileDto = new UpdateUserProfileDto(
        userId,
        fullName,
        nickName
      );
      await updateUserProfileDto.validate();
      if (req.userId !== userId) {
        return res
          .status(StatusCodeEnums.Forbidden_403)
          .json({ message: "Forbidden access" });
      }

      const result = await updateUserProfileByIdService(userId, {
        fullName,
        nickName,
        avatar,
      });
      await checkFileSuccess(avatar);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ user: result, message: "Update user profile successfully" });
    } catch (error) {
      await deleteFile(req.file.path);
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
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

    const updateUserEmailDto = new UpdateUserEmailDto(userId, email);
    await updateUserEmailDto.validate();

    try {
      const result = await updateUserEmailByIdService(userId, email);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ user: result, message: "Update user email successfully" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async updateUserPasswordByIdController(req, res) {
    try {
      const { userId } = req.params;
      const { oldPassword, newPassword } = req.body;

      if (req.userId !== userId) {
        return res
          .status(StatusCodeEnums.Forbidden_403)
          .json({ message: "Forbidden access" });
      }
      const updateUserPasswordDto = new UpdateUserPasswordDto(
        userId,
        oldPassword,
        newPassword
      );
      await updateUserPasswordDto.validate();

      const result = await updateUserPasswordByIdService(userId, {
        oldPassword,
        newPassword,
      });

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Update user password successfully" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }
  async toggleFollowController(req, res) {
    try {
      let result;
      const { userId, followId, action } = req.body;
      const toggleFollowDto = new ToggleFollowDto(userId, followId, action);
      await toggleFollowDto.validate();

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
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }
  async getUserWalletController(req, res) {
    const userId = req.userId;
    console.log(userId);
    try {
      const wallet = await getUserWalletService(userId);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ wallet: wallet, message: "Success" });
    } catch (error) {
      return res
        .status(StatusCodeEnums.InternalServerError_500)
        .json({ message: error.message });
    }
  }
  async updateUserWalletController(req, res) {
    const userId = req.userId;
    const { amount, actionCurrencyType, exchangeRate } = req.body;
    if (!amount || !actionCurrencyType || !userId) {
      return res
        .status(StatusCodeEnums.BadRequest_400)
        .json("Missing field: amount, actionCurrencyType");
    }
    try {
      const user = await updateUserWalletService(
        userId,
        actionCurrencyType,
        amount,
        exchangeRate
      );
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ user: user, message: "Success" });
    } catch (error) {
      return res
        .status(StatusCodeEnums.InternalServerError_500)
        .json({ message: error.message });
    }
  }
}

module.exports = UserController;
