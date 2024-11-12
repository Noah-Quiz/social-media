const DatabaseTransaction = require("../repositories/DatabaseTransaction");

const createMemberPackService = async (
  name,
  description,
  price,
  durationUnit,
  durationNumber
) => {
  const connection = new DatabaseTransaction();
  if (isNaN(price) || isNaN(durationNumber)) {
    throw new Error("Invalid price or duration number");
  }
  try {
    const checkMemberPack =
      await connection.memberPackRepository.findMemberPackByName(name);
    if (checkMemberPack) {
      throw new Error("This name has been taken");
    }
    const memberPack =
      await connection.memberPackRepository.createMemberPackRepository({
        name,
        description,
        price,
        durationUnit,
        durationNumber,
      });
    return memberPack;
  } catch (error) {
    throw new Error(error.message);
  }
};
const updateMemberPackService = async (
  id,
  name,
  description,
  price,
  durationUnit,
  durationNumber
) => {
  const connection = new DatabaseTransaction();
  try {
    const checkMemberPack =
      await connection.memberPackRepository.findMemberPackByName(name);
    if (checkMemberPack) {
      throw new Error("This name has been taken");
    }
    const memberPack =
      await connection.memberPackRepository.updateMemberPackRepository(
        id,
        name,
        description,
        price,
        durationUnit,
        durationNumber
      );
    return memberPack;
  } catch (error) {
    throw new Error(error.message);
  }
};
const getMemberPackService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const memberPack =
      await connection.memberPackRepository.getMemberPackRepository(id);
    return memberPack;
  } catch (error) {
    throw new Error(error.message);
  }
};
const getAllMemberPackService = async () => {
  const connection = new DatabaseTransaction();
  try {
    const memberPacks =
      await connection.memberPackRepository.getAllPackRepository();
    return memberPacks;
  } catch (error) {
    throw new Error(error.message);
  }
};
const deleteMemberPackService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const checkMemberPack =
      await connection.memberPackRepository.getMemberPackRepository(id);
    if (!checkMemberPack) {
      throw new Error("Member Pack not found");
    }
    const memberPack =
      await connection.memberPackRepository.deleteMemberPackRepository(id);
    return memberPack;
  } catch (error) {
    throw new Error(error.message);
  }
};
module.exports = {
  createMemberPackService,
  getMemberPackService,
  updateMemberPackService,
  getAllMemberPackService,
  deleteMemberPackService,
};
