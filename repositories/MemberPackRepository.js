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

  async updateMemberPackRepository(
    id,
    name,
    description,
    price,
    durationUnit,
    durationNumber
  ) {
    try {
      const memberPack = await MemberPack.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      });
      if (!memberPack) {
        throw new Error("Member pack not found");
      }

      if (name !== undefined && name !== memberPack.name) {
        memberPack.name = name;
      }
      if (description !== undefined && description !== memberPack.description) {
        memberPack.description = description;
      }
      if (price !== undefined && price !== memberPack.price && !isNaN(price)) {
        memberPack.price = price;
      }
      if (
        durationUnit !== undefined &&
        durationUnit !== memberPack.durationUnit
      ) {
        memberPack.durationUnit = durationUnit;
      }
      if (
        durationNumber !== undefined &&
        durationNumber !== memberPack.durationNumber &&
        !isNaN(durationNumber)
      ) {
        memberPack.durationNumber = durationNumber;
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
      const memberPack = await MemberPack.findByIdAndUpdate(
        id,
        {
          $set: { isDeleted: true },
        },
        { new: true }
      );
      return memberPack;
    } catch (error) {
      throw new Error("Error deleting member pack: " + error.message);
    }
  }
}

module.exports = MemberPackRepository;
