const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");

const createCategoryService = async (categoryData) => {
  try {
    const connection = new DatabaseTransaction();

    const session = await connection.startTransaction();

    const category = await connection.categoryRepository.createCategoryRepository(
      categoryData,
      session
    );

    await connection.commitTransaction();
    return category;
  } catch (error) {
    await connection.abortTransaction();
    throw error;
  }
};

const getCategoryService = async (categoryId) => {
  try {
    const connection = new DatabaseTransaction();

    const category = await connection.categoryRepository.getCategoryRepository(categoryId);

    if (!category) {
      throw new CoreException(StatusCodeEnums.NotFound_404, `Category not found` );
    }

    return category;
  } catch (error) {
    throw error;
  }
};

const getAllCategoryService = async () => {
  try {
    const connection = new DatabaseTransaction();

    return await connection.categoryRepository.getAllCategoryRepository();
  } catch (error) {
    throw error;
  }
};

const updateCategoryService = async (categoryId, categoryData) => {
  try {
    const connection = new DatabaseTransaction();
    
    const session = await connection.startTransaction();

    const updatedCategory = await connection.categoryRepository.updateCategoryRepository(
      categoryId,
      categoryData,
      session
    );

    await connection.commitTransaction();
    return updatedCategory;
  } catch (error) {
    await connection.abortTransaction();
    throw error;
  }
};

const deleteCategoryService = async (categoryId) => {
  const connection = new DatabaseTransaction();
  try {
    const session = await connection.startTransaction();

    const category = await connection.categoryRepository.getCategoryRepository(categoryId);

    if (!category || category.isDeleted === true) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Category not found")
    }

    const deletedCategory = await connection.categoryRepository.deleteCategoryRepository(
      categoryId,
      session
    );
    
    await connection.commitTransaction();
    return deletedCategory;
  } catch (error) {
    await connection.abortTransaction();
    throw error;
  }
};

module.exports = {
  createCategoryService,
  getAllCategoryService,
  getCategoryService,
  deleteCategoryService,
  updateCategoryService,
};
