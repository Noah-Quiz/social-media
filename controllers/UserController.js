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
  updateTotalWatchTimeService,
  updateUserPasswordByIdService,
  getUserWalletService,
  updateUserWalletService,
  toggleFollowUserService,
  getStatsByDateService,
} = require("../services/UserService");
const mongoose = require("mongoose");
const { deleteFile, checkFileSuccess } = require("../utils/stores/storeImage");
const UpdateUserPasswordDto = require("../dtos/User/UpdateUserPasswordDto");
const UpdateUserEmailDto = require("../dtos/User/UpdateUserEmailDto");
const GetUserWalletDto = require("../dtos/User/GetUserWalletDto");
const UpdateUserWalletDto = require("../dtos/User/UpdateUserWalletDto");
const DeleteUserDto = require("../dtos/User/DeleteUserDto");

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
    try {
      const { userId } = req.params;
      const deleteUserDto = new DeleteUserDto(userId);
      await deleteUserDto.validate();

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
      if (req.file) {
        await checkFileSuccess(avatar);
      }
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ user: result, message: "Update user profile successfully" });
    } catch (error) {
      if (req.file) {
        await deleteFile(req.file.path);
      }
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
      const { userId, followId, action } = req.body;
      const toggleFollowDto = new ToggleFollowDto(userId, followId, action);
      await toggleFollowDto.validate();

      const result = await toggleFollowUserService(userId, followId, action);

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

  async getStatsByDateController(req, res) {
    const { userId, fromDate, toDate } = req.body;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Valid user ID is required" });
    }

    try {
      const result = await getStatsByDateService(userId, fromDate, toDate);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Success", result });
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
    try {
      const { userId } = req.params;
      if (userId !== req.userId) {
        return res
          .status(StatusCodeEnums.Forbidden_403)
          .json({ message: "Forbidden access" });
      }
      const getUserWalletDto = new GetUserWalletDto(userId);
      await getUserWalletDto.validate();
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
    try {
      const { userId } = req.params;
      if (userId !== req.userId) {
        return res
          .status(StatusCodeEnums.Forbidden_403)
          .json({ message: "Forbidden access" });
      }

      const { amount, actionCurrencyType, exchangeRate } = req.body;

      const updateUserWalletDto = new UpdateUserWalletDto(
        userId,
        amount,
        actionCurrencyType,
        exchangeRate
      );
      await updateUserWalletDto.validate();

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

  async updateTotalWatchTimeController(req, res) {
    const { userId, watchTime } = req.body;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Valid user ID is required" });
    }
    try {
      const result = await updateTotalWatchTimeService(userId, watchTime);
      return res.status(StatusCodeEnums.OK_200).json({
        message: "Update watch time successfully",
      });
    } catch (error) {
      return res
        .status(StatusCodeEnums.InternalServerError_500)
        .json({ message: error.message });
    }
  }
}

module.exports = UserController;
