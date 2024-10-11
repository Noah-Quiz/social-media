const { default: mongoose } = require("mongoose");
const User = require("../entities/UserEntity");

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
      const user = await User.findByIdAndUpdate(userId, { isDeleted: true });
      return true;
    } catch (error) {
      throw new Error(`Error when delete an user by id: ${error.message}`);
    }
  }

  async updateAnUserByIdRepository(userId, data) {
    try {
      const user = await User.findByIdAndUpdate(userId, data, {
        new: true,
        select: "email fullName",
      });
      return user;
    } catch (error) {
      throw new Error(`Error when updating user by id: ${error.message}`);
    }
  }

  async getAnUserByIdRepository(userId) {
    try {
      const user = await User.findOne({ _id: userId, isDeleted: false }).select(
        "email fullName nickName follow followBy avatar phoneNumber"
      );
      if (user) {
        return user;
      }
      return false;
    } catch (error) {
      throw new Error(`Error when getting a user by id: ${error.message}`);
    }
  }

  async getAllUsersRepository(page, size, name) {
    try {
      const query = { isDeleted: false };

      if (name) {
        query.$or = [
          { fullName: { $regex: name, $options: "i" } },
          { nickName: { $regex: name, $options: "i" } },
        ];
      }

      const skip = (page - 1) * size;
      const users = await User.find(query)
        .select("email fullName nickName follow followBy avatar phoneNumber")
        .skip(skip)
        .limit(size);

      const totalUsers = await User.countDocuments(query);

      return {
        data: users,
        message: "Get all users successfully",
        page: page,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / size),
      };
    } catch (error) {
      throw new Error(`Error when getting all users: ${error.message}`);
    }
  }

  async followAnUserRepository(userId, followId) {
    const user = await User.findOne({ _id: userId });
    const follow = await User.findOne({ _id: followId });
    if (!user || !follow) {
      return false;
    }

    try {
      await User.updateOne(
        { _id: userId },
        { $addToSet: { follow: followId } }
      );

      await User.updateOne(
        { _id: followId },
        { $addToSet: { followBy: userId } }
      );

      console.log(`User ${userId} follows user ${followId} successfully`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async unfollowAnUserRepository(userId, followId) {
    const user = await User.findOne({ _id: userId });
    const follow = await User.findOne({ _id: followId });
    console.log(user);
    if (!user || !follow) {
      return false;
    }

    try {
      await User.updateOne({ _id: userId }, { $pull: { follow: followId } });

      await User.updateOne({ _id: followId }, { $pull: { followBy: userId } });

      return true;
    } catch (error) {
      return false;
    }
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
}

module.exports = UserRepository;
