const {
  createCategoryService,
  getAllCategoryService,
  deleteCategoryService,
  updateCategoryService,
  getCategoryService,
} = require("../services/CategoryService");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const { checkFileSuccess, deleteFile } = require("../utils/stores/storeImage");
const CreateCategoryDto = require("../dtos/Category/CreateCategoryDto");
const DeleteCategoryDto = require("../dtos/Category/DeleteCategoryDto");
const UpdateCategoryDto = require("../dtos/Category/UpdateCategoryDto");
const GetCategoryDto = require("../dtos/Category/GetCategoryDto");

class CategoryController {
  async createCategoryController(req, res) {
    try {
      const { name } = req.body;
      const createCategoryDto = new CreateCategoryDto(name);
      await createCategoryDto.validate();

      const categoryData = { name };

      const result = await createCategoryService(categoryData);
      return res
        .status(StatusCodeEnums.Created_201)
        .json({ category: result, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async getCategoryController(req, res) {
    try {
      const { categoryId } = req.params;
      const getCategoryDto = new GetCategoryDto(categoryId);
      await getCategoryDto.validate();

      const category = await getCategoryService(categoryId);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ category, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async getAllCategoryController(req, res) {
    try {
      const categories = await getAllCategoryService();

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ categories, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async updateCategoryController(req, res) {
    try {
      const { categoryId } = req.params;
      const { name } = req.body;
      const imageUrl = req.file ? req.file.path : null;
      const categoryData = { name, imageUrl };

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
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async deleteCategoryController(req, res) {
    try {
      const { categoryId } = req.params;
      const deleteCategoryDto = new DeleteCategoryDto(categoryId);
      await deleteCategoryDto.validate();

      const category = await deleteCategoryService(categoryId);
      // await deleteFile(category.imageUrl);

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }
}

module.exports = CategoryController;
