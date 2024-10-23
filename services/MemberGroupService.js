const {
  VerificationAttemptsSummaryInstance,
} = require("twilio/lib/rest/verify/v2/verificationAttemptsSummary");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");

const updateVipService = async (userId, ownerId, packId) => {
  try {
    const connection = new DatabaseTransaction();
    const response = await connection.memberGroupRepository.updateVip(
      userId,
      ownerId,
      packId
    );
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};
const getMemberGroupService = async (ownerId) => {
  try {
    const connection = new DatabaseTransaction();
    const memberGroup =
      await connection.memberGroupRepository.getMemberGroupRepository(ownerId);
    return memberGroup;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllMemberGroupService = async () => {
  try {
    const connection = new DatabaseTransaction();
    const memberGroup =
      await connection.memberGroupRepository.getAllMemberGroupRepository();
    return memberGroup;
  } catch (error) {
    throw new Error(error.message);
  }
};
const deleteMemberGroupService = async (ownerId) => {
  try {
    console.log("Service: ", ownerId);
    const connection = new DatabaseTransaction();
    const room =
      await connection.memberGroupRepository.getMemberGroupRepository(ownerId);
    if (!room) {
      throw new Error("Member group not found");
    }

    const deleted =
      await connection.memberGroupRepository.deleteMemberGroupRepository(
        room._id
      );
    return deleted;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  updateVipService,
  getAllMemberGroupService,
  getMemberGroupService,
  deleteMemberGroupService,
};
