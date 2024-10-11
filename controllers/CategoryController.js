const { default: mongoose } = require("mongoose");
const {
  createCategoryService,
  getAllCategoryService,
  deleteCategoryService,
  updateCategoryService,
  getCategoryService,
} = require("../services/CategoryService");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");

class CategoryController {
  async createCategoryController(req, res) {
    try {
      const category = req.body;
      
      const result = await createCategoryService(category);
      
      return res.status(StatusCodeEnums.Created_201).json({ category: result, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
      }
    }
  }

  async getCategoryController(req, res) {
    try {
      const { categoryId } = req.params;

      if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(StatusCodeEnums.BadRequest_400).json({ message: "Valid category ID is required" });
      }

      const category = await getCategoryService(categoryId);

      return res.status(StatusCodeEnums.OK_200).json({ category, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
      }
    }
  }

  async getAllCategoryController(req, res) {
    try {
      const categories = await getAllCategoryService();

      return res.status(StatusCodeEnums.OK_200).json({ categories, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
      }
    }
  }

  async updateCategoryController(req, res) {
    try {
      const { categoryId } = req.params;
      const { name, imageUrl } = req.body;
      const categoryData = { name, imageUrl };

      if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(StatusCodeEnums.BadRequest_400).json({ message: "Valid category ID is required" });
      }

      const result = await updateCategoryService(categoryId, categoryData);
      
      return res.status(StatusCodeEnums.OK_200).json({ category: result, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
      }
    }
  }

  async deleteCategoryController(req, res) {
    try {
      const { categoryId } = req.params;

      if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(StatusCodeEnums.BadRequest_400).json({ message: "Valid category ID is required" });
      }

      await deleteCategoryService(categoryId);

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
      }
    }
  }
}

module.exports = CategoryController;
