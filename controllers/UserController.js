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
const GetUsersDto = require("../dtos/User/GetUsersDto");
const UpdateUserPointDto = require("../dtos/User/UpdateUserPointDto");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const UserEnum = require("../enums/UserEnum");

class UserController {
  async getAllUsersController(req, res, next) {
    try {
      const query = {
        page: req.query.page || 1,
        size: req.query.size || 10,
        search: req.query.search,
        order: req.query.order,
        sortBy: req.query.sortBy,
      };

      const getUsersDto = new GetUsersDto(
        query.page,
        query.size,
        query.order,
        query.sortBy
      );
      await getUsersDto.validate();

      const { users, total, page, totalPages } = await getAllUsersService(
        query
      );

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Success", users, total, page, totalPages });
    } catch (error) {
      next(error);
    }
  }

  async deleteUserByIdController(req, res, next) {
    try {
      const { userId } = req.params;
      const deleteUserDto = new DeleteUserDto(userId);
      await deleteUserDto.validate();

      await deleteUserByIdService(userId);

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async getUserByIdController(req, res, next) {
    const { userId } = req.params;
    const requester = req.userId;

    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Invalid user ID"
        );
      }

      const user = await getUserByIdService(userId, requester);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ user, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async updateUserProfileByIdController(req, res, next) {
    try {
      const { userId } = req.params;
      const { fullName, nickName } = req.body;
      let avatar = req.file ? req.file.path : null;

      const connection = new DatabaseTransaction();
      const user = await connection.userRepository.findUserById(userId);
      if (!user) {
        throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
      }
      if (user.role !== UserEnum.ADMIN && req.userId !== userId) {
        throw new CoreException(
          StatusCodeEnums.Forbidden_403,
          "Forbidden access"
        );
      }

      const updateUserProfileDto = new UpdateUserProfileDto(
        userId,
        fullName,
        nickName
      );
      await updateUserProfileDto.validate();

      let updateData = { fullName, nickName };
      if (avatar) {
        updateData.avatar = avatar;
      }

      const result = await updateUserProfileByIdService(userId, updateData);
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

      const connection = new DatabaseTransaction();
      const user = await connection.userRepository.findUserById(userId);
      if (!user) {
        throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
      }
      if (user.role !== UserEnum.ADMIN && req.userId !== userId) {
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

      const connection = new DatabaseTransaction();
      const user = await connection.userRepository.findUserById(userId);
      if (!user) {
        throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
      }
      if (user.role !== UserEnum.ADMIN && req.userId !== userId) {
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
      const requester = req.userId;
      const getUserWalletDto = new GetUserWalletDto(userId);
      await getUserWalletDto.validate();
      const wallet = await getUserWalletService(userId, requester);
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
      const requester = req.userId;

      if (!userId) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "User ID is required"
        );
      }

      const follower = await getFollowerService(userId, requester);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ follower, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
  async getFollowingController(req, res, next) {
    try {
      const { userId } = req.params;
      const requester = req.userId;

      if (!userId) {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "User ID is required"
        );
      }

      const following = await getFollowingService(userId, requester);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ following, message: "success" });
    } catch (error) {
      next(error);
    }
  }
  async updatePointController(req, res, next) {
    try {
      const { amount, type } = req.body;
      const userId = req.userId;
      const updateUserPointDto = new UpdateUserPointDto(amount, type);
      await updateUserPointDto.validate();

      const result = await updatePointService(userId, parseInt(amount), type);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ data: result, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
