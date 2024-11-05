const { default: mongoose } = require("mongoose");
const User = require("../entities/UserEntity");
const Video = require("../entities/VideoEntity");

class UserRepository {
  async createUser(data, session) {
    try {
      const user = await User.create(data);
      const newUser = await User.findById(user._id).select("email fullName");
      return newUser;
    } catch (error) {
      throw new Error(`Error when creating user: ${error.message}`);
    }
  }

  async findUserById(userId) {
    try {
      const user = await User.findById(userId);

      return user;
    } catch (error) {
      throw new Error(`Error when finding user by id: ${error.message}`);
    }
  }

  async findUserByEmail(email) {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (error) {
      throw new Error(`Error when finding user by email: ${error.message}`);
    }
  }

  async findUserByPhoneNumber(phoneNumber) {
    try {
      const user = await User.findOne({ phoneNumber });
      return user;
    } catch (error) {
      throw new Error(
        `Error when finding user by phone number: ${error.message}`
      );
    }
  }

  async deleteAnUserByIdRepository(userId) {
    try {
      await User.findByIdAndUpdate(userId, { isDeleted: true });

      return true;
    } catch (error) {
      throw new Error(`Error when delete an user by id: ${error.message}`);
    }
  }

  async updateAnUserByIdRepository(userId, data) {
    try {
      data = {
        ...data,
        lastUpdated: Date.now(),
      };

      const user = await User.findByIdAndUpdate(userId, data, {
        new: true,
        select:
          "email fullName nickName avatar phoneNumber dateCreated lastLogin",
      });

      return user;
    } catch (error) {
      throw new Error(`Error when updating user by id: ${error.message}`);
    }
  }

  async getAnUserByIdRepository(userId) {
    try {
      const user = await User.findOne({ _id: userId, isDeleted: false })
        .select(
          "email fullName nickName avatar phoneNumber dateCreated lastLogin follow followBy role"
        )
        .lean();

      if (user) {
        return user;
      }
      return false;
    } catch (error) {
      throw new Error(`Error when getting a user by id: ${error.message}`);
    }
  }

  async getAllUsersRepository(query) {
    try {
      let { page, size, search, order, sortBy } = query;
      size = parseInt(size);
      page = parseInt(page);
      const searchQuery = { isDeleted: false };

      if (search) {
        searchQuery.$or = [
          { fullName: { $regex: search, $options: "i" } },
          { nickName: { $regex: search, $options: "i" } },
        ];
      }

      let sortField = "dateCreated"; // Default sort field
      let sortOrder = order === "ascending" ? 1 : -1;

      if (sortBy === "follower") sortField = "followers";
      else if (sortBy === "date") sortField = "dateCreated";

      const skip = (page - 1) * size;
      const users = await User.aggregate([
        { $match: searchQuery },
        {
          $addFields: {
            followByCount: { $size: "$followBy" },
          },
        },
        {
          $sort: { followByCount: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: size,
        },
        {
          $project: {
            email: 1,
            fullName: 1,
            nickName: 1,
            followCount: { $size: "$followBy" },
            followByCount: { $size: "$follow" },
            avatar: 1,
            phoneNumber: 1,
            dateCreated: 1,
            lastLogin: 1,
          },
        },
        { $sort: { [sortField]: sortOrder } },
      ]);

      const totalUsers = await User.countDocuments(searchQuery);

      return {
        users,
        page: page,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / size),
      };
    } catch (error) {
      throw new Error(`Error when getting all users: ${error.message}`);
    }
  }

  async toggleFollowAnUserRepository(userId, followId, action) {
    const user = await User.findOne({ _id: userId });
    const follow = await User.findOne({ _id: followId });
    if (!user || !follow) {
      return false;
    }

    try {
      if (action === "follow") {
        await User.updateOne(
          { _id: userId },
          {
            $addToSet: {
              follow: {
                followId: new mongoose.Types.ObjectId(followId),
                followDate: Date.now(),
              },
            },
          }
        );

        await User.updateOne(
          { _id: followId },
          {
            $addToSet: {
              followBy: {
                followById: new mongoose.Types.ObjectId(userId),
                followByDate: Date.now(),
              },
            },
          }
        );
        return true;
      } else if (action === "unfollow") {
        await User.updateOne({ _id: userId }, { $pull: { follow: followId } });

        await User.updateOne(
          { _id: followId },
          { $pull: { followBy: userId } }
        );
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  }

  async updateTotalWatchTimeRepository(userId, watchTime) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $inc: { totalWatchTime: watchTime },
        },
        {
          new: true,
        }
      );
      await User.findByIdAndUpdate(userId, {
        point: this.calculatePoint(user.totalWatchTime),
      });
      return true;
    } catch (error) {
      console.error("Error updating total watch time:", error);
    }
  }

  calculatePoint(totalWatchTime) {
    return Math.floor(totalWatchTime / 60);
  }

  async notifiFollowRepository(userId, followId) {
    try {
      const user = await User.findOne({ _id: userId });
      const follow = await User.findOne({ _id: followId });

      if (!follow) {
        console.log("User to follow not found");
        return false;
      }

      const notificationObject = {
        avatar: user.avatar,
        content: `${user.fullName} đang follow bạn`,
        check: userId,
        seen: false,
        createdAt: new Date(),
      };

      await User.updateOne(
        { _id: followId },
        { $push: { notifications: notificationObject } }
      );

      console.log(`Notification sent to user ${followId} successfully`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async notifiLikeVideoRepository(videoOwnerId, notificationObject) {
    try {
      const videoOfUser = await User.findOne({ _id: videoOwnerId });

      if (!videoOfUser) {
        console.log("Video not found");
        return false;
      }

      // Đẩy thông báo vào danh sách notifications của người được follow
      await User.updateOne(
        { _id: videoOwnerId },
        { $push: { notifications: notificationObject } }
      );

      console.log(`Notification sent to user ${followId} successfully`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async notifiLikeCommentRepository(userId, notification) {
    try {
      await User.updateOne(
        { _id: userId },
        { $push: { notifications: notification } }
      );
      console.log(`Notification sent to user ${userId} successfully`);
      return true;
    } catch (error) {
      throw new Error(`Failed to send notification: ${error.message}`);
    }
  }

  async notifiCommentRepository(userId, notification) {
    try {
      console.log("UserId:", userId);
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      user.notifications.push(notification);

      await user.save();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getUserWallet(userId) {
    const defaultWallet = {
      balance: 0,
      coin: 0,
    };
    try {
      const user = await User.findOne({ _id: userId, isDeleted: false });
      if (!user) {
        throw new Error("No user found");
      }
      if (!user.wallet) {
        return defaultWallet;
      }
      const userWallet = {
        ...user.wallet,
        formatedBalance: user.wallet.balance.toLocaleString(),
        formatedCoin: user.wallet.coin.toLocaleString(),
      };
      return userWallet;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async topUpUserBalance(userId, amount) {
    try {
      const user = await User.findOne({ _id: userId, isDeleted: false });
      if (!user) {
        throw new Error("User not found");
      }
      if (!user.wallet) {
        user.wallet = { balance: 0, coin: 0 };
      }
      user.wallet.balance += amount;

      await user.save();
      return user.wallet;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  //exchange rate: 1000vnd => 1 balance => 1000 coin: default
  async updateUserWalletRepository(
    userId,
    actionCurrencyType,
    amount,
    exchangeRate
  ) {
    try {
      const user = await User.findOne({ _id: userId, isDeleted: false });
      if (!user) {
        throw new Error("User not found");
      }
      if (!user.wallet) {
        user.wallet = { balance: 0, coin: 0 };
      }

      switch (actionCurrencyType) {
        case "ReceiveCoin":
          user.wallet.coin += amount;
          break;
        case "SpendBalance":
          if (user.wallet.balance < amount) {
            throw new Error("Insufficient balance");
          }
          user.wallet.balance -= amount;
          break;

        case "SpendCoin":
          if (user.wallet.coin < amount) {
            throw new Error("Insufficient coin");
          }
          user.wallet.coin -= amount;
          break;

        case "ExchangeBalanceToCoin":
          if (user.wallet.balance < amount) {
            throw new Error("Insufficient balance");
          }
          user.wallet.balance -= amount;
          user.wallet.coin += amount * exchangeRate;
          break;
        case "ExchangeCoinToBalance":
          if (user.wallet.coin < amount) {
            throw new Error("Insufficient coin");
          }
          user.wallet.coin -= amount;
          user.wallet.balance += amount * exchangeRate;
          break;
        default:
          throw new Error("Invalid action currency type");
      }

      await user.save();
      const userWallet = {
        ...user.wallet,
        formatedBalance: user.wallet.balance.toLocaleString(),
        formatedCoin: user.wallet.coin.toLocaleString(),
      };
      return userWallet;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getStatsByDateRepository(userId, fromDate, toDate) {
    try {
      const fromDateString = new Date(fromDate + "T00:00:00.000Z");
      const toDateString = new Date(toDate + "T23:59:59.999Z");

      const userStats = await User.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $project: {
            totalFollows: {
              $size: {
                $filter: {
                  input: "$follow",
                  as: "f",
                  cond: {
                    $and: [
                      { $gte: ["$$f.followDate", fromDateString] },
                      { $lt: ["$$f.followDate", toDateString] },
                    ],
                  },
                },
              },
            },
            totalFollowers: {
              $size: {
                $filter: {
                  input: "$followBy",
                  as: "fb",
                  cond: {
                    $and: [
                      { $gte: ["$$fb.followByDate", fromDateString] },
                      { $lt: ["$$fb.followByDate", toDateString] },
                    ],
                  },
                },
              },
            },
          },
        },
      ]);

      const userStat = userStats[0];
      const { _id, ...user } = userStat;

      const video = await Video.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            dateCreated: {
              $gte: fromDateString,
              $lte: toDateString,
            },
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            totalLikes: { $sum: { $size: "$likedBy" } },
            totalViews: { $sum: "$numOfViews" },
            totalVideo: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ]);
      const result = video[0];

      return {
        ...result,
        ...user,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async getFollowerRepository(userId) {
    try {
      const user = await User.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(userId),
            isDeleted: false,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "followBy.followById",
            foreignField: "_id",
            as: "followers",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  fullName: 1,
                  nickName: 1,
                  avatar: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            followers: 1,
          },
        },
      ]);

      return user.length > 0 ? user[0].followers : [];
    } catch (error) {
      throw new Error(`Error getting follower: ${error.message}`);
    }
  }
  async getFollowingRepository(userId) {
    try {
      const user = await User.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(userId),
            isDeleted: false,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "follow.followId",
            foreignField: "_id",
            as: "following",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  fullName: 1,
                  nickName: 1,
                  avatar: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            following: 1,
          },
        },
      ]);

      return user.length > 0 ? user[0].following : [];
    } catch (error) {
      throw new Error(`Error getting following: ${error.message}`);
    }
  }

  async countNewUsersTodayRepository() {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      return await User.countDocuments({
        isDeleted: false,
        dateCreated: { $gte: startOfDay, $lte: endOfDay },
      });
    } catch (error) {
      throw new Error(`Error counting new users today: ${error.message}`);
    }
  }

  async countNewUsersThisWeekRepository() {
    try {
      const today = new Date();
      const startOfWeek = new Date(
        today.setDate(today.getDate() - today.getDay())
      );

      return await User.countDocuments({
        isDeleted: false,
        dateCreated: { $gte: startOfWeek },
      });
    } catch (error) {
      throw new Error(`Error counting new users this week: ${error.message}`);
    }
  }

  async countNewUsersThisMonthRepository() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1); // Đầu tháng
    startOfMonth.setHours(0, 0, 0, 0);

    return await User.countDocuments({
      isDeleted: false,
      dateCreated: { $gte: startOfMonth },
    });
  }

  async countNewUsersMonthlyRepository() {
    const result = await User.aggregate([
      {
        $match: { dateCreated: { $ne: null }, isDeleted: false }, // Lọc ra các bản ghi có createdAt là null
      },
      {
        $group: {
          _id: {
            year: { $year: "$dateCreated" },
            month: { $month: "$dateCreated" },
          },
          newUsersCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    return result;
  }
  async updateUserPointRepository(userId, amount, type) {
    try {
      const user = await User.findOne({
        _id: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      });
      if (!user) {
        throw new Error("User not found");
      }

      switch (type) {
        case "add":
          user.point += amount;
          break;
        case "remove":
          if (user.point < amount) {
            throw new Error("Insufficient point");
          }
          user.point -= amount;
          break;
        case "exchange":
          if (user.point < amount) {
            throw new Error("Insufficient point");
          }
          user.point -= amount;
          user.wallet.coin += amount;
          break;
        default:
          break;
      }
      await user.save();

      return { point: user.point, wallet: user.wallet };
    } catch (error) {
      throw new Error(`Error updating user point: ${error.message}`);
    }
  }
}

module.exports = UserRepository;
