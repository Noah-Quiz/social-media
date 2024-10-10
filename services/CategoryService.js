const DatabaseTransaction = require("../repositories/DatabaseTransaction");

const createCategoryService = async (categoryData) => {
  const connection = new DatabaseTransaction();
  try {
    const session = await connection.startTransaction();
    const category = await connection.categoryRepository.createCategory(
      categoryData,
      session
    );

    await connection.commitTransaction();
    return category;
  } catch (error) {
    await connection.abortTransaction();
    throw new Error(error.message);
  }
};

const getCategoryService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    return await connection.categoryRepository.getCategory(id);
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllCategoryService = async () => {
  const connection = new DatabaseTransaction();
  try {
    return await connection.categoryRepository.getAllCategory();
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateCategoryService = async (id, categoryData) => {
  const connection = new DatabaseTransaction();
  try {
    const session = await connection.startTransaction();
    const category = await connection.categoryRepository.updateCategory(
      id,
      categoryData,
      session
    );
    await connection.commitTransaction();
    return category;
  } catch (error) {
    await connection.abortTransaction();
    throw new Error(error.message);
  }
};

const deleteCategoryService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const session = await connection.startTransaction();
    const category = await connection.categoryRepository.deleteCategory(
      id,
      session
    );
    await connection.commitTransaction();
    return category;
  } catch (error) {
    await connection.abortTransaction();
    throw new Error(error.message);
  }
};

const deactivateCategoryService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const session = await connection.startTransaction();
    const category = await connection.categoryRepository.deactivateCategory(
      id,
      session
    );
    await connection.commitTransaction();
    return category;
  } catch (error) {
    await connection.abortTransaction();
    throw new Error(error.message);
  }
};

module.exports = {
  createCategoryService,
  getAllCategoryService,
  getCategoryService,
  deactivateCategoryService,
  deleteCategoryService,
  updateCategoryService,
};
