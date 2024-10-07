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

  async findUserByEmail(email) {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (error) {
      throw new Error(`Error when finding user by email: ${error.message}`);
    }
  }

  async updateAnUserByIdRepository(userId, data) {
    try {
      const user = await User.findByIdAndUpdate(userId, data).select(
        "email fullName"
      );
      return user;
    } catch (error) {
      throw new Error(`Error when update user by id: ${error.message}`);
    }
  }

  async getAnUserByIdRepository(userId) {
    try {
      const user = await User.findById(userId).select("email fullName");
      if (user) {
        return user;
      }
      return false;
    } catch (error) {
      throw new Error(`Error when get an user by id: ${error.message}`);
    }
  }

  async getAllUsersRepository() {
    try {
      const users = await User.find().select("email fullName");
      return users;
    } catch (error) {
      throw new Error(`Error when get all users: ${error.message}`);
    }
  }

  async followAnUserRepository(userId, followId) {
    const user = await User.findOne({ _id: userId });
    const follow = await User.findOne({ _id: followId });
    if (!user || !follow) {
      console.log(`User ${userId} or user ${followId} does not exist`);
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
      console.log("Error at followAUserRepository");
      return false;
    }
  }

  async unfollowAnUserRepository(userId, followId) {
    const user = await User.findOne({ _id: userId });
    const follow = await User.findOne({ _id: followId });
    console.log(user);
    if (!user || !follow) {
      console.log(`User ${userId} or user ${followId} does not exist`);
      return false;
    }

    try {
      await User.updateOne({ _id: userId }, { $pull: { follow: followId } });

      await User.updateOne({ _id: followId }, { $pull: { followBy: userId } });

      console.log(`User ${userId} unfollows user ${followId} successfully`);
      return true;
    } catch (error) {
      console.log("Error at unfollowAUserRepository");
      return false;
    }
  }
}

module.exports = UserRepository;
