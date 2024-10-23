const { default: mongoose } = require("mongoose");
const MemberGroup = require("../entities/MemberGroupEntity");
const MemberPack = require("../entities/MemberPackEntity");
const User = require("../entities/UserEntity");
class MemberGroupRepository {
  async createMemberGroup(ownerId) {
    try {
      const memberGroup = await MemberGroup.create({ ownerId });
      return memberGroup;
    } catch (error) {
      throw new Error(`Error creating member group: ${error.message}`);
    }
  }

  async getMemberGroup(ownerId) {
    try {
      const memberGroup = await MemberGroup.findOne({ ownerId });
      return memberGroup;
    } catch (error) {
      throw new Error(`Error getting member group: ${error.message}`);
    }
  }

  async getAllMember(ownerId) {
    try {
      const memberGroup = await MemberGroup.findOne({ ownerId }).populate({
        path: "members.memberId",
        select: "fullName nickName avatar _id",
      });
      return memberGroup ? memberGroup.members : [];
    } catch (error) {
      throw new Error("Error getting all member");
    }
  }
  async getAllMemberGroup() {
    try {
      const memberGroup = await MemberGroup.find({ isDeleted: false });
      return memberGroup;
    } catch (error) {
      throw new Error(`Error getting all member group: ${error.message}`);
    }
  }

  async updateVip(userId, ownerId, packId) {
    try {
      // Prevent owner from buying membership for themselves
      if (userId === ownerId) {
        throw new Error("Cannot buy membership for yourself");
      }

      // Check if a MemberGroup for the owner exists, or create one
      let memberGroup = await MemberGroup.findOne({ ownerId });
      if (!memberGroup) {
        memberGroup = await MemberGroup.create({ ownerId });
      }

      // Find the member pack
      const memberPack = await MemberPack.findOne({
        _id: packId,
        isDeleted: false,
      });
      if (!memberPack) {
        throw new Error("Invalid packId");
      }
      const user = await User.findOne({
        _id: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      });
      user.wallet.coin -= memberPack.price;
      user.save();
      const owner = await User.findOne({
        _id: new mongoose.Types.ObjectId(ownerId),
        isDeleted: false,
      });
      owner.wallet.coin += memberPack.price;
      owner.save();
      // Calculate the duration in milliseconds based on the pack's durationUnit and durationNumber
      let time = 0;
      switch (memberPack.durationUnit) {
        case "DAY":
          time = 86400000 * memberPack.durationNumber;
          break;
        case "MONTH":
          time = 86400000 * 30 * memberPack.durationNumber;
          break;
        case "YEAR":
          time = 86400000 * 30 * 12 * memberPack.durationNumber;
          break;
        default:
          throw new Error("Invalid duration unit");
      }

      // Calculate the end date based on the current date + duration
      const endDate = new Date(Date.now() + time);

      // Check if the user is already in the members array
      const existingMember = memberGroup.members.find(
        (member) => member.memberId.toString() === userId.toString()
      );

      if (existingMember) {
        // Update the existing member's details
        existingMember.package = packId;

        // Keep the existing join date, but extend the end date
        existingMember.endDate = new Date(
          existingMember.endDate.getTime() + time
        );
      } else {
        // Add the new member to the members array if they don't already exist
        memberGroup.members.push({
          memberId: userId,
          joinDate: new Date(),
          package: packId,
          endDate: endDate,
        });
      }

      // Save the updated member group
      await memberGroup.save();
      return memberGroup;
    } catch (error) {
      throw new Error(`Error updating vip: ${error.message}`);
    }
  }
}

module.exports = MemberGroupRepository;
