require("dotenv").config();
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const CoreException = require("../exceptions/CoreException");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const { capitalizeWords } = require("../utils/validator");
const createGiftService = async (name, image, pricePerUnit) => {
  const connection = new DatabaseTransaction();
  try {
    const price = parseFloat(pricePerUnit);

    if (isNaN(price)) {
      throw new Error("Invalid price");
    }
    const newName = capitalizeWords(name);
    const checkGift = await connection.giftRepository.getGiftByNameRepository(
      newName
    );
    if (checkGift) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Gift name has already been taken"
      );
    }

    const gift = await connection.giftRepository.createGiftRepository({
      name: newName,
      image: `${process.env.APP_BASE_URL}/${image}`,
      valuePerUnit: price,
    });
    return gift;
  } catch (error) {
    throw error;
  }
};
const updateGiftService = async (id, name, image, price) => {
  const connection = new DatabaseTransaction();
  try {
    const checkGift = await connection.giftRepository.getGiftByNameRepository(
      name
    );
    if (checkGift) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Gift name has already been taken"
      );
    }
    const checkGiftId = await connection.giftRepository.getGiftRepository(id);
    if (!checkGiftId) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Gift not found");
    }
    const gift = await connection.giftRepository.updateGiftRepository(
      id,
      name,
      `${process.env.APP_BASE_URL}/${image}`,
      price
    );
    return gift;
  } catch (error) {
    throw error;
  }
};
const getGiftService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const gift = await connection.giftRepository.getGiftRepository(id);
    if (!gift) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Gift not found");
    }
    return gift;
  } catch (error) {
    throw error;
  }
};
const getAllGiftService = async () => {
  const connection = new DatabaseTransaction();
  try {
    const gifts = await connection.giftRepository.getAllGiftRepository();
    return gifts;
  } catch (error) {
    throw error;
  }
};
const deleteGiftService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const checkGift = await connection.giftRepository.getGiftRepository(id);
    if (!checkGift) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Gift not found");
    }
    const gift = await connection.giftRepository.deleteGiftRepository(id);
    return gift;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createGiftService,
  updateGiftService,
  getGiftService,
  getAllGiftService,
  deleteGiftService,
};
