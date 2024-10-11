const Category = require("../entities/CategoryEntity");

class CategoryRepository {
  async createCategoryRepository(data, session = null) {
    try {
      const category = await Category.create([data], { session });
      return category[0];
    } catch (error) {
      throw new Error(`Error creating category: ${error.message}`);
    }
  }

  async getCategoryRepository(id) {
    try {
      const category = await Category.findOne({ _id: id, isDeleted: "false" });
      return category;
    } catch (error) {
      throw new Error(`Error getting category: ${error.message}`);
    }
  }

  async getAllCategoryRepository() {
    try {
      const categories = await Category.find({ isDeleted: "false" });
      return categories;
    } catch (error) {
      throw new Error(`Error getting all categories: ${error.message}`);
    }
  }

  async updateCategoryRepository(categoryId, categoryData, session = null) {
    categoryData.lastUpdated = new Date();
    try {
      const category = await Category.findByIdAndUpdate(categoryId, categoryData, {
        new: true,
        session,
      });
      return category;
    } catch (error) {
      throw new Error(`Error updating category: ${error.message}`);
    }
  }

  async deleteCategoryRepository(id, session = null) {
    try {
      const category = await Category.findByIdAndUpdate(
        id,
        {
          $set: {
            isDeleted: true,
            lastUpdated: new Date(),
          },
        },
        { session }
      );

      return category;
    } catch (error) {
      throw new Error(`Error deleting category: ${error.message}`);
    }
  }
}

module.exports = CategoryRepository;
