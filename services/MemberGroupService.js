const {
  VerificationAttemptsSummaryInstance,
} = require("twilio/lib/rest/verify/v2/verificationAttemptsSummary");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const CoreException = require("../exceptions/CoreException");
const StatusCodeEnums = require("../enums/StatusCodeEnum");

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
    throw error;
  }
};

const getMemberGroupService = async (ownerId) => {
  try {
    const connection = new DatabaseTransaction();
    const memberGroup =
      await connection.memberGroupRepository.getMemberGroupRepository(ownerId);
    return memberGroup;
  } catch (error) {
    throw error;
  }
};

const getAllMemberGroupService = async () => {
  try {
    const connection = new DatabaseTransaction();
    const memberGroup =
      await connection.memberGroupRepository.getAllMemberGroupRepository();
    return memberGroup;
  } catch (error) {
    throw error;
  }
};
const deleteMemberGroupService = async (requester, ownerId) => {
  try {
    console.log("Service: ", ownerId);
    const connection = new DatabaseTransaction();
    const user = await connection.userRepository.getAnUserByIdRepository(
      requester
    );
    const notAdmin = user.role !== 1;
    const notOwner = requester !== ownerId;
    if (notAdmin && notOwner) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You don't have authorization to delete this group"
      );
    }
    const checkuser = await connection.userRepository.getAnUserByIdRepository(
      ownerId
    );
    if (!checkuser || checkuser === false) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }
    const room =
      await connection.memberGroupRepository.getMemberGroupRepository(ownerId);
    if (!room) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Member group not found"
      );
    }

    const deleted =
      await connection.memberGroupRepository.deleteMemberGroupRepository(
        room._id
      );
    return deleted;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  updateVipService,
  getAllMemberGroupService,
  getMemberGroupService,
  deleteMemberGroupService,
};
