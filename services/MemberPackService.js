const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
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
    throw new CoreException(
      StatusCodeEnums.BadRequest_400,
      "Invalid price or duration number"
    );
  }
  try {
    const checkMemberPack =
      await connection.memberPackRepository.findMemberPackByName(name);
    if (checkMemberPack) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "This name has already been taken"
      );
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
    throw error;
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
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "This name has already been taken"
      );
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
    throw error;
  }
};
const getMemberPackService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const memberPack =
      await connection.memberPackRepository.getMemberPackRepository(id);
    return memberPack;
  } catch (error) {
    throw error;
  }
};
const getAllMemberPackService = async () => {
  const connection = new DatabaseTransaction();
  try {
    const memberPacks =
      await connection.memberPackRepository.getAllPackRepository();
    return memberPacks;
  } catch (error) {
    throw error;
  }
};
const deleteMemberPackService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const checkMemberPack =
      await connection.memberPackRepository.getMemberPackRepository(id);
    if (!checkMemberPack) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Memberpack not found"
      );
    }
    const memberPack =
      await connection.memberPackRepository.deleteMemberPackRepository(id);
    return memberPack;
  } catch (error) {
    throw error;
  }
};
module.exports = {
  createMemberPackService,
  getMemberPackService,
  updateMemberPackService,
  getAllMemberPackService,
  deleteMemberPackService,
};
