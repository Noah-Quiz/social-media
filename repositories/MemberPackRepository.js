const { default: mongoose } = require("mongoose");
const MemberPack = require("../entities/MemberPackEntity");

class MemberPackRepository {
  async createMemberPackRepository(memberPack) {
    try {
      const newMemberPack = await MemberPack.create(memberPack);
      return newMemberPack;
    } catch (error) {
      throw new Error("Error creating member pack: " + error.message);
    }
  }

  async getMemberPackRepository(id) {
    try {
      const memberPack = await MemberPack.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      });
      return memberPack;
    } catch (error) {
      throw new Error("Error getting member pack: " + error.message);
    }
  }

  async updateMemberPackRepository(id, updates) {
    try {
      const memberPack = await MemberPack.findById(id);
      if (!memberPack) {
        throw new Error("Member pack not found");
      }

      if (updates.name !== undefined && updates.name !== memberPack.name) {
        memberPack.name = updates.name;
      }
      if (
        updates.description !== undefined &&
        updates.description !== memberPack.description
      ) {
        memberPack.description = updates.description;
      }
      if (updates.price !== undefined && updates.price !== memberPack.price) {
        memberPack.price = updates.price;
      }
      if (
        updates.durationUnit !== undefined &&
        updates.durationUnit !== memberPack.durationUnit
      ) {
        memberPack.durationUnit = updates.durationUnit;
      }
      if (
        updates.durationNumber !== undefined &&
        updates.durationNumber !== memberPack.durationNumber
      ) {
        memberPack.durationNumber = updates.durationNumber;
      }

      await memberPack.save();
      return memberPack;
    } catch (error) {
      throw new Error("Error updating member pack: " + error.message);
    }
  }

  async getAllPackRepository() {
    try {
      const memberPacks = await MemberPack.find({ isDeleted: false });
      return memberPacks;
    } catch (error) {
      throw new Error("Error getting all member packs: " + error.message);
    }
  }

  async deleteMemberPackRepository(id) {
    try {
      const memberPack = await MemberPack.findByIdAndUpdate(id, {
        $set: { isDeleted: true },
      });
      return memberPack;
    } catch (error) {
      throw new Error("Error deleting member pack: " + error.message);
    }
  }
}

module.exports = MemberPackRepository;
