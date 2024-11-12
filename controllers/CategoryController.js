const {
  createCategoryService,
  getAllCategoryService,
  deleteCategoryService,
  updateCategoryService,
  getCategoryService,
} = require("../services/CategoryService");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const { checkFileSuccess, deleteFile } = require("../middlewares/storeFile");
const CreateCategoryDto = require("../dtos/Category/CreateCategoryDto");
const DeleteCategoryDto = require("../dtos/Category/DeleteCategoryDto");
const UpdateCategoryDto = require("../dtos/Category/UpdateCategoryDto");
const GetCategoryDto = require("../dtos/Category/GetCategoryDto");

class CategoryController {
  async createCategoryController(req, res, next) {
    try {
      const { name } = req.body;
      let imageUrl = req.file ? req.file.path : null;
      const createCategoryDto = new CreateCategoryDto(name);
      await createCategoryDto.validate();
      const categoryData = { name, imageUrl };
      const result = await createCategoryService(categoryData);

      if (req.file) {
        await checkFileSuccess(imageUrl);
      }

      return res
        .status(StatusCodeEnums.Created_201)
        .json({ category: result, message: "Success" });
    } catch (error) {
      if (req.file) {
        await deleteFile(req.file.path);
      }
      next(error);
    }
  }

  async getCategoryController(req, res, next) {
    try {
      const { categoryId } = req.params;
      const getCategoryDto = new GetCategoryDto(categoryId);
      await getCategoryDto.validate();

      const category = await getCategoryService(categoryId);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ category, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async getAllCategoryController(req, res, next) {
    const { name } = req.query;
    try {
      const categories = await getAllCategoryService(name);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ categories, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async updateCategoryController(req, res, next) {
    try {
      const { categoryId } = req.params;
      const { name } = req.body;
      const imageUrl = req.file ? req.file.path : null;

      let categoryData = { name, imageUrl };
      if (imageUrl === null || imageUrl === undefined) categoryData = { name };

      const updateCategoryDto = new UpdateCategoryDto(categoryId, name);
      await updateCategoryDto.validate();

      const result = await updateCategoryService(categoryId, categoryData);

      if (req.file) {
        await checkFileSuccess(imageUrl);
      }

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ category: result, message: "Update category successfully" });
    } catch (error) {
      if (req.file) {
        await deleteFile(req.file.path);
      }
      next(error);
    }
  }

  async deleteCategoryController(req, res, next) {
    try {
      const { categoryId } = req.params;
      const deleteCategoryDto = new DeleteCategoryDto(categoryId);
      await deleteCategoryDto.validate();

      const category = await deleteCategoryService(categoryId);
      // await deleteFile(category.imageUrl);

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;
