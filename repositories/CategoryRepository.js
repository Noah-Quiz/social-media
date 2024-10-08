const Category = require("../entities/CategoryEntity");

class CategoryRepository {
  async createCategory(data, session = null) {
    try {
      const category = await Category.create([data], { session });
      return category[0];
    } catch (error) {
      throw new Error(`Error creating category: ${error.message}`);
    }
  }

  async getCategory(id) {
    try {
      const category = await Category.findOne({ _id: id, isDeleted: "false" });
      return category;
    } catch (error) {
      throw new Error(`Error getting category: ${error.message}`);
    }
  }

  async getAllCategory() {
    try {
      const categories = await Category.find({ isDeleted: "false" });
      return categories;
    } catch (error) {
      throw new Error(`Error getting all categories: ${error.message}`);
    }
  }

  async updateCategory(id, data, session = null) {
    data.lastUpdated = new Date();
    try {
      const category = await Category.findByIdAndUpdate(id, data, {
        new: true,
        session,
      });
      return category;
    } catch (error) {
      throw new Error(`Error updating category: ${error.message}`);
    }
  }

  async deleteCategory(id, session = null) {
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
