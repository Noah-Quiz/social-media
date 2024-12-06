const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");

const getReceiptService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const receipt = await connection.receiptRepository.findByIdRepository(id);
    return receipt;
  } catch (error) {
    throw error;
  }
};
const getAllUserReceiptService = async (userId) => {
  const connection = new DatabaseTransaction();
  try {
    const user = await connection.userRepository.getAnUserByIdRepository(
      userId
    );
    if (!user || user === false) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }
    const receipts = await connection.receiptRepository.findByUserIdRepository(
      userId
    );
    return receipts;
  } catch (error) {
    throw error;
  }
};

const deleteReceiptService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const checkReceipt = await connection.receiptRepository.findByIdRepository(
      id
    );
    if (!checkReceipt) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Receipt not found"
      );
    }
    const receipt = await connection.receiptRepository.softDeleteRepository(id);
    return receipt;
  } catch (error) {
    throw error;
  }
};
const createReceiptService = async ({
  userId,
  paymentMethod,
  paymentPort,
  bankCode,
  amount,
  transactionId,
  type,
  exchangeRate,
}) => {
  const connection = new DatabaseTransaction();
  try {
    const receipt = await connection.receiptRepository.createReceiptRepository(
      userId,
      paymentMethod,
      paymentPort,
      bankCode,
      amount,
      transactionId,
      type,
      (exchangeRate = exchangeRate)
    );
    return receipt;
  } catch (error) {
    throw error;
  }
};
module.exports = {
  getReceiptService,
  getAllUserReceiptService,
  deleteReceiptService,
  createReceiptService,
};
