const {
  VerificationAttemptsSummaryInstance,
} = require("twilio/lib/rest/verify/v2/verificationAttemptsSummary");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const CoreException = require("../exceptions/CoreException");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const UserEnum = require("../enums/UserEnum");
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

const getMemberGroupService = async (ownerId, requesterId) => {
  try {
    const connection = new DatabaseTransaction();
    const checkUser = await connection.userRepository.getAnUserByIdRepository(
      requesterId
    );

    if (!checkUser || checkUser === false) {
      throw new CoreException(StatusCodeEnums.NOT_FOUND, "User not found");
    }
    const checkOwner = await connection.userRepository.getAnUserByIdRepository(
      ownerId
    );
    if (!checkOwner || checkOwner === false) {
      throw new CoreException(StatusCodeEnums.NOT_FOUND, "Owner not found");
    }
    const isOwner = ownerId?.toString() === requesterId?.toString();
    const isAdmin = checkUser?.role === UserEnum.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You do not have the permission to perform this action"
      );
    }
    const memberGroup =
      await connection.memberGroupRepository.getMemberGroupRepository(ownerId);
    if (!memberGroup) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Member group not found"
      );
    }
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
