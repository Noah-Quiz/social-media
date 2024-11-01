const { default: mongoose } = require("mongoose");
const MemberGroup = require("../entities/MemberGroupEntity");
const MemberPack = require("../entities/MemberPackEntity");
const User = require("../entities/UserEntity");
const getLogger = require("../utils/logger");
const logger = getLogger("MEMBERSHIP");
const DatabaseTransaction = require("./DatabaseTransaction");
class MemberGroupRepository {
  async getMemberGroupRepository(ownerId) {
    try {
      const memberGroup = await MemberGroup.findOne({
        ownerId,
        isDeleted: false,
      });
      if (!memberGroup) {
        const group = await MemberGroup.create({ ownerId: ownerId });
        return group;
      }
      return memberGroup;
    } catch (error) {
      throw new Error(`Error getting member group: ${error.message}`);
    }
  }

  async getAllMemberGroupRepository() {
    try {
      const memberGroup = await MemberGroup.find({ isDeleted: false });
      return memberGroup;
    } catch (error) {
      throw new Error(`Error getting all member group: ${error.message}`);
    }
  }
  async deleteMemberGroupRepository(id) {
    try {
      const memberGroup = await MemberGroup.findOne({
        _id: id,
      });
      if (!memberGroup) {
        throw new Error("No member group found");
      }
      if (memberGroup && memberGroup.members?.length > 0) {
        throw new Error("Can't delete when there's still member");
      }
      memberGroup.isDeleted = true;
      await memberGroup.save();
      return memberGroup;
    } catch (error) {
      throw new Error(`Error deleting member group: ${error.message}`);
    }
  }

  //try DatabaseTransaction => error DatabaseTransaction not a constructor
  async updateVip(userId, ownerId, packId) {
    const session = await mongoose.startSession(); // Step 1: Start a session
    session.startTransaction();
    try {
      // Prevent owner from buying membership for themselves
      if (userId === ownerId) {
        throw new Error("Cannot buy membership for yourself");
      }

      // Check if a MemberGroup for the owner exists, or create one
      let memberGroup = await MemberGroup.findOne({
        ownerId,
        isDeleted: false,
      }).session(session);
      if (!memberGroup) {
        memberGroup = await MemberGroup.create([{ ownerId }], { session });
      }

      // Find the member pack
      const memberPack = await MemberPack.findOne({
        _id: packId,
        isDeleted: false,
      }).session(session);
      if (!memberPack) {
        throw new Error("Invalid packId");
      }

      // Find the user
      const user = await User.findOne({
        _id: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      }).session(session);
      if (!user) {
        throw new Error("User not found");
      }

      // Deduct the price from the user's wallet
      user.wallet.coin -= memberPack.price;
      await user.save({ session }); // Pass the session to save()

      // Find the owner
      const owner = await User.findOne({
        _id: new mongoose.Types.ObjectId(ownerId),
        isDeleted: false,
      }).session(session);
      if (!owner) {
        throw new Error("Owner not found");
      }

      // Add the price to the owner's wallet
      owner.wallet.coin += memberPack.price;
      await owner.save({ session }); // Pass the session to save()

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
          time = 86400000 * 365 * memberPack.durationNumber;
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
      await memberGroup.save({ session }); // Save with the session

      // Step 4: Commit the transaction
      await session.commitTransaction();
      await session.endSession(); // Ensure session is ended
      return memberGroup;
    } catch (error) {
      // Step 5: Abort the transaction if anything goes wrong
      await session.abortTransaction();
      await session.endSession(); // Ensure session is ended
      throw new Error(`Error updating VIP: ${error.message}`);
    }
  }

  async removeMemberCron(id, memberId) {
    try {
      const memberGroup = await MemberGroup.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      });

      if (!memberGroup) {
        console.log(`No member group found for id: ${id}`);
        return;
      }

      // Check if the member exists in the members array
      const existingMember = memberGroup.members.find(
        (member) => member.memberId.toString() === memberId.toString()
      );

      if (existingMember) {
        // Remove the member from the members array
        memberGroup.members = memberGroup.members.filter(
          (member) => member.memberId.toString() !== memberId.toString()
        );

        // Save the updated member group
        await memberGroup.save();
        return memberGroup;
      } else {
        console.log(`No member found with id: ${memberId} in group: ${id}`);
      }
    } catch (error) {
      console.log(
        `Fail to remove for group ${id}, member ${memberId}: ${error.message}`
      );
    }
  }

  async handleExpire() {
    try {
      const memberGroups = await MemberGroup.find({ isDeleted: false });

      let number = 0;
      const now = new Date();

      // Iterate over each group
      for (const group of memberGroups) {
        const membersToRemove = [];

        // Check members whose endDate has expired
        group.members.forEach((member) => {
          const expireDate = new Date(member.endDate);
          if (now > expireDate) {
            membersToRemove.push(member.memberId); // Collect members to remove
          }
        });

        // Remove expired members one by one (avoiding version conflict)
        for (const memberId of membersToRemove) {
          await this.removeMemberCron(group._id, memberId); // Await the removal
          number++;
        }
      }
      logger.info(`Number of people expired and removed: ${number}`);
    } catch (error) {
      console.log(`Error handling expired users: ${error.message}`);
    }
  }
}

module.exports = MemberGroupRepository;
