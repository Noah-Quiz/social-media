const ToggleFollowDto = require("../dtos/User/ToggleFollowDto");
const UpdateUserProfileDto = require("../dtos/User/UpdateUserProfileDto");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const {
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
  getFollowerService,
  getFollowingService,
  updatePointService,
} = require("../services/UserService");
const mongoose = require("mongoose");
const { deleteFile, checkFileSuccess } = require("../middlewares/storeFile");
const UpdateUserPasswordDto = require("../dtos/User/UpdateUserPasswordDto");
const UpdateUserEmailDto = require("../dtos/User/UpdateUserEmailDto");
const GetUserWalletDto = require("../dtos/User/GetUserWalletDto");
const UpdateUserWalletDto = require("../dtos/User/UpdateUserWalletDto");
const DeleteUserDto = require("../dtos/User/DeleteUserDto");

class UserController {
  async getAllUsersController(req, res, next) {
    try {
      const { page, size, name } = req.query;

      const result = await getAllUsersService(
        page || 1,
        size || 10,
        name || ""
      );

      return res.status(StatusCodeEnums.OK_200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteUserByIdController(req, res, next) {
    try {
      const { userId } = req.params;
      const deleteUserDto = new DeleteUserDto(userId);
      await deleteUserDto.validate();

      const result = await deleteUserByIdService(userId);

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async getUserByIdController(req, res, next) {
    const { userId } = req.params;

    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid user ID"
        );
      }
      const result = await getUserByIdService(userId);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ user: result, message: "Get user successfully" });
    } catch (error) {
      next(error);
    }
  }
  async updateUserProfileByIdController(req, res, next) {
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
        throw new CoreException(
          StatusCodeEnums.Forbidden_403,
          "Forbidden access"
        );
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
      next(error);
    }
  }

  async updateUserEmailByIdController(req, res, next) {
    try {
      const { userId } = req.params;
      const { email } = req.body;

      if (req.userId !== userId) {
        throw new CoreException(
          StatusCodeEnums.Forbidden_403,
          "Forbidden access"
        );
      }

      const updateUserEmailDto = new UpdateUserEmailDto(userId, email);
      await updateUserEmailDto.validate();

      const result = await updateUserEmailByIdService(userId, email);
      return res.status(StatusCodeEnums.OK_200).json({
        user: result,
        message:
          "Update user email successfully, the verification link will be sent to your new email!",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserPasswordByIdController(req, res, next) {
    try {
      const { userId } = req.params;
      const { oldPassword, newPassword } = req.body;

      if (req.userId !== userId) {
        throw new CoreException(
          StatusCodeEnums.Forbidden_403,
          "Forbidden access"
        );
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
      next(error);
    }
  }
  async toggleFollowController(req, res, next) {
    try {
      const { userId, followId, action } = req.body;
      console.log("user: ", userId);
      console.log("follow: ", followId);
      const toggleFollowDto = new ToggleFollowDto(userId, followId, action);
      await toggleFollowDto.validate();

      const result = await toggleFollowUserService(userId, followId, action);

      return res.status(StatusCodeEnums.OK_200).json({
        message: `${action.charAt(0).toUpperCase() + action.slice(1)} success`,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatsByDateController(req, res, next) {
    try {
      const { userId, fromDate, toDate } = req.query;
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid user ID"
        );
      }

      const result = await getStatsByDateService(userId, fromDate, toDate);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Success", result });
    } catch (error) {
      next(error);
    }
  }
  async getUserWalletController(req, res, next) {
    try {
      const { userId } = req.params;
      if (userId !== req.userId) {
        throw new CoreException(
          StatusCodeEnums.Forbidden_403,
          "Forbidden access"
        );
      }
      const getUserWalletDto = new GetUserWalletDto(userId);
      await getUserWalletDto.validate();
      const wallet = await getUserWalletService(userId);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ wallet: wallet, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
  async updateUserWalletController(req, res, next) {
    try {
      const { userId } = req.params;
      if (userId !== req.userId) {
        throw new CoreException(
          StatusCodeEnums.Forbidden_403,
          "Forbidden access"
        );
      }

      const { amount, actionCurrencyType } = req.body;
      const updateUserWalletDto = new UpdateUserWalletDto(
        userId,
        amount,
        actionCurrencyType
      );
      await updateUserWalletDto.validate();

      const user = await updateUserWalletService(
        userId,
        actionCurrencyType,
        amount
      );
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ user: user, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async updateTotalWatchTimeController(req, res, next) {
    try {
      const { userId, watchTime } = req.body;
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid user ID"
        );
      }
      const result = await updateTotalWatchTimeService(userId, watchTime);
      return res.status(StatusCodeEnums.OK_200).json({
        message: "Update watch time successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getFollowerController(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "User ID is required"
        );
      }
      const result = await getFollowerService(userId);
      if (!result || result.length === 0) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "No follower found"
        );
      }
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ follower: result, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
  async getFollowingController(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "User ID is required"
        );
      }
      const result = await getFollowingService(userId);
      if (!result || result.length === 0) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "No following found"
        );
      }
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ following: result, message: "success" });
    } catch (error) {
      next(error);
    }
  }
  async updatePointController(req, res, next) {
    try {
      const { amount, type } = req.body;
      const userId = req.userId;
      if (!amount || !type || !userId) {
        throw new CoreException(StatusCodes.BadRequest_400, "Missing fields");
      }
      if (isNaN(amount) || amount < 0) {
        throw new CoreException(StatusCodes.BadRequest_400, "Invalid amount");
      }
      if (!["add", "remove", "exchange"].includes(type)) {
        throw new CoreException(StatusCodes.BadRequest_400, "Invalid type");
      }
      const result = await updatePointService(userId, amount, type);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ data: result, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
