const User = require("../model/userModel");
const mongoose = require("mongoose");
module.exports = {
  followAUserRepository: async (userId, followId) => {
    const user = await User.findOne({ _id: userId });
    const follower = await User.findOne({
      _id: followId,
    });
    if (!user || !follower) {
      console.log(`User ${userId} hoặc user ${followId} không tồn tại`);
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
      console.log(`User ${userId} follow thành công user ${followId}`);
      return true;
    } catch (error) {
      console.log("Có lỗi xảy ra trong lúc follow");
      return false;
    }
  },

  unfollowAUserRepository: async (userId, followId) => {
    const user = await User.findOne({ _id: userId });
    const follower = await User.findOne({
      _id: followId,
    });
    if (!user || !follower) {
      console.log(`User ${userId} hoặc user ${followId} không tồn tại`);
      return false;
    }

    try {
      await User.updateOne({ _id: userId }, { $pull: { follow: followId } });

      await User.updateOne({ _id: followId }, { $pull: { followBy: userId } });
      console.log(`User ${userId} follow thành công user ${followId}`);
      return true;
    } catch (error) {
      console.log("Có lỗi xảy ra trong lúc follow");
      return false;
    }
  },
};
