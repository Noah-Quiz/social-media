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

  async getAllUsersRepository(page, size) {
    try {
      const query = { isDeleted: false };
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
}

module.exports = UserRepository;
