const {
  createCategory,
  getAllCategory,
  getCategory,
  deactivateCategory,
  deleteCategory,
  updateCategory,
} = require("../services/CategoryService");

class CategoryController {
  async createCategory(req, res) {
    try {
      const category = req.body;
      const result = await createCategory(category);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCategory(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: "id is required" });
      }
      const category = await getCategory(id);
      if (!category) {
        return res
          .status(404)
          .json({ error: `No category found for id: ${id}` });
      }
      return res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllCategory(req, res) {
    try {
      const categories = await getAllCategory();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const categoryData = req.body;
      const result = await updateCategory(id, categoryData);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deactivateCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await deactivateCategory(id);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await deleteCategory(id);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CategoryController;
