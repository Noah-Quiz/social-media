const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const { capitalizeWords } = require("../utils/validator");

const createCategoryService = async (categoryData) => {
  const connection = new DatabaseTransaction();
  categoryData.name = capitalizeWords(categoryData.name);
  try {
    const session = await connection.startTransaction();
    const checkCate = await connection.categoryRepository.getCategoryByName(
      categoryData.name
    );
    if (checkCate) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Category name has been taken"
      );
    }
    categoryData.imageUrl = `${process.env.APP_BASE_URL}/${categoryData.imageUrl}`;
    const category =
      await connection.categoryRepository.createCategoryRepository(
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

    const category = await connection.categoryRepository.getCategoryRepository(
      categoryId
    );

    if (!category) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        `Category not found`
      );
    }

    return category;
  } catch (error) {
    throw error;
  }
};

const getAllCategoryService = async (query) => {
  try {
    const connection = new DatabaseTransaction();

    return await connection.categoryRepository.getAllCategoryRepository(query);
  } catch (error) {
    throw error;
  }
};

const updateCategoryService = async (categoryId, categoryData) => {
  const connection = new DatabaseTransaction();
  try {
    const category = await connection.categoryRepository.getCategoryRepository(
      categoryId
    );
    if (!category) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Category not found"
      );
    }

    const checkCate = await connection.categoryRepository.getCategoryByName(
      categoryData.name
    );
    if (checkCate) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Category name has been taken"
      );
    }

    if (categoryData.imageUrl)
      categoryData.imageUrl = `${process.env.APP_BASE_URL}/${categoryData.imageUrl}`;

    const updatedCategory =
      await connection.categoryRepository.updateCategoryRepository(
        categoryId,
        categoryData
      );

    return updatedCategory;
  } catch (error) {
    throw error;
  }
};

const deleteCategoryService = async (categoryId) => {
  const connection = new DatabaseTransaction();
  try {
    const session = await connection.startTransaction();

    const category = await connection.categoryRepository.getCategoryRepository(
      categoryId
    );

    if (!category || category.isDeleted === true) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Category not found"
      );
    }

    const deletedCategory =
      await connection.categoryRepository.deleteCategoryRepository(
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
