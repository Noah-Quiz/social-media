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
      const category = await Category.findOne({ _id: id, status: "active" });
      return category;
    } catch (error) {
      throw new Error(`Error getting category: ${error.message}`);
    }
  }

  async getAllCategory() {
    try {
      const categories = await Category.find({ status: "active" });
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
            status: "archived",
            lastUpdated: new Date(),
          },
        },
        { new: true, session } // Returns the updated document
      );

      return category;
    } catch (error) {
      throw new Error(`Error archiving category: ${error.message}`);
    }
  }

  async deactivateCategory(id, session = null) {
    try {
      const category = await Category.findByIdAndUpdate(
        id,
        { status: "archived", lastUpdated: new Date() },
        { new: true, session }
      );
      return category;
    } catch (error) {
      throw new Error(`Error deactivating category: ${error.message}`);
    }
  }
}

module.exports = CategoryRepository;
