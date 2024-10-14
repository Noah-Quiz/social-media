const DatabaseTransaction = require("../repositories/DatabaseTransaction");

const createGiftService = async (name, image, pricePerUnit) => {
  const connection = new DatabaseTransaction();
  try {
    const price = parseFloat(pricePerUnit);
    if (isNaN(price)) {
      throw new Error("Invalid price");
    }
    const gift = await connection.giftRepository.createGiftRepository({
      name: name,
      image: image,
      valuePerUnit: price,
    });
    return gift;
  } catch (error) {
    throw new Error(error.message);
  }
};
const updateGiftService = async (id, name, image, price) => {
  const connection = new DatabaseTransaction();
  try {
    const gift = await connection.giftRepository.updateGiftRepository(
      id,
      name,
      image,
      price
    );
    return gift;
  } catch (error) {
    throw new Error(error.message);
  }
};
const getGiftService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const gift = await connection.giftRepository.getGiftRepository(id);
    return gift;
  } catch (error) {
    throw new Error(error.message);
  }
};
const getAllGiftService = async () => {
  const connection = new DatabaseTransaction();
  try {
    const gifts = await connection.giftRepository.getAllGiftRepository();
    return gifts;
  } catch (error) {
    throw new Error(error.message);
  }
};
const deleteGiftService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const gift = await connection.giftRepository.deleteGiftRepository(id);
    return gift;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createGiftService,
  updateGiftService,
  getGiftService,
  getAllGiftService,
  deleteGiftService,
};
