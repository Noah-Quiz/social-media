const DatabaseTransaction = require("../repositories/DatabaseTransaction");

const getReceiptService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const receipt = await connection.receiptRepository.findByIdRepository(id);
    return receipt;
  } catch (error) {
    throw new Error(error.message);
  }
};
const getAllUserReceiptService = async (userId) => {
  const connection = new DatabaseTransaction();
  try {
    const receipts = await connection.receiptRepository.findByUserIdRepository(
      userId
    );
    return receipts;
  } catch (error) {
    throw new Error(error.message);
  }
};

const deleteReceiptService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const receipt = await connection.receiptRepository.softDeleteRepository(id);
    return receipt;
  } catch (error) {
    throw new Error(error.message);
  }
};
const createReceiptService = async (
  userId,
  paymentMethod,
  paymentPort,
  bankCode,
  amount,
  transactionId
) => {
  const connection = new DatabaseTransaction();
  try {
    const receipt = await connection.receiptRepository.createReceiptRepository(
      userId,
      paymentMethod,
      paymentPort,
      bankCode,
      amount,
      transactionId
    );
    return receipt;
  } catch (error) {
    throw new Error(error.message);
  }
};
module.exports = {
  getReceiptService,
  getAllUserReceiptService,
  deleteReceiptService,
  createReceiptService,
};
