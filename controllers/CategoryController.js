const {
  createCategoryService,
  getAllCategoryService,
  getCategoryService,
  deactivateCategoryService,
  deleteCategoryService,
  updateCategoryService,
} = require("../services/CategoryService");

class CategoryController {
  async createCategoryController(req, res) {
    try {
      const category = req.body;
      const result = await createCategoryService(category);
      res.status(201).json({ result, message: "Success" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getCategoryController(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "id is required" });
      }
      const category = await getCategoryService(id);
      if (!category) {
        return res.status(404).json({ message: `Category not found` });
      }
      return res.status(200).json({ category });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAllCategoryController(req, res) {
    try {
      const categories = await getAllCategoryService();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateCategoryController(req, res) {
    try {
      const { id } = req.params;
      const categoryData = req.body;
      const result = await updateCategoryService(id, categoryData);
      res.status(200).json({ result, message: "Success" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deactivateCategoryController(req, res) {
    try {
      const { id } = req.params;
      const result = await deactivateCategoryService(id);
      res.status(200).json({ result, message: "Success" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteCategoryController(req, res) {
    try {
      const { id } = req.params;
      await deleteCategoryService(id);
      res.status(200).json({ message: "Success" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = CategoryController;
