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
    throw new Error("In valid price or duration number");
  }
  try {
    const memberPack =
      connection.memberPackRepository.createMemberPackRepository({
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
  if (isNaN(price) || isNaN(durationNumber)) {
    throw new Error("In valid price or duration number");
  }
  try {
    const memberPack =
      connection.memberPackRepository.updateMemberPackRepository(
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
const getMemberPackService = (id) => {
  const connection = new DatabaseTransaction();
  try {
    const memberPack =
      connection.memberPackRepository.getMemberPackRepository(id);
    return memberPack;
  } catch (error) {
    throw new Error(error.message);
  }
};
const getAllMemberPackService = () => {
  const connection = new DatabaseTransaction();
  try {
    const memberPacks = connection.memberPackRepository.getAllPackRepository();
    return memberPacks;
  } catch (error) {
    throw new Error(error.message);
  }
};
const deleteMemberPackService = (id) => {
  const connection = new DatabaseTransaction();
  try {
    const memberPack =
      connection.memberPackRepository.deleteMemberPackRepository(id);
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
