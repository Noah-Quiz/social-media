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

module.exports = {
  updateVipService,
};
