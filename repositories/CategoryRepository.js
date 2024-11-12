const Category = require("../entities/CategoryEntity");

class CategoryRepository {
  async createCategoryRepository(data, session = null) {
    try {
      const category = await Category.create([data], { session });
      const result = category[0].toObject();

      // Remove unwanted fields
      delete result.__v;
      delete result.lastUpdated;
      delete result.isDeleted;
      return result;
    } catch (error) {
      throw new Error(`Error creating category: ${error.message}`);
    }
  }
  async getCategoryByName(name) {
    try {
      const category = await Category.findOne({ name: name, isDeleted: false });
      return category;
    } catch (error) {
      throw new Error(`Error getting category by name: ${error.message}`);
    }
  }
  async getCategoryRepository(id) {
    try {
      const category = await Category.findOne({ _id: id, isDeleted: false });
      if (!category) {
        return null;
      }

      const result = category.toObject();

      // Remove unwanted fields
      delete result.__v;
      delete result.lastUpdated;
      delete result.isDeleted;
      return result;
    } catch (error) {
      throw new Error(`Error getting category: ${error.message}`);
    }
  }

  async getAllCategoryRepository(query) {
    try {
      const searchCriteria = {
        isDeleted: false,
        ...(query ? { name: { $regex: query, $options: "i" } } : {}), // Match name if query is provided
      };
      let categories = await Category.find(searchCriteria).lean();

      // Remove unwanted fields from each category
      categories = categories.map((category) => {
        delete category.__v;
        delete category.lastUpdated;
        delete category.isDeleted;
        return category;
      });

      return categories;
    } catch (error) {
      throw new Error(`Error getting all categories: ${error.message}`);
    }
  }

  async updateCategoryRepository(categoryId, categoryData, session = null) {
    categoryData.lastUpdated = new Date();
    try {
      const category = await Category.findByIdAndUpdate(
        categoryId,
        categoryData,
        {
          new: true,
          session,
        }
      );
      if (!category) {
        return null;
      }
      const result = category.toObject();

      // Remove unwanted fields
      delete result.__v;
      delete result.lastUpdated;
      delete result.isDeleted;
      return result;
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
      if (!category) {
        return null;
      }
      const result = category.toObject();

      // Remove unwanted fields
      delete result.__v;
      delete result.lastUpdated;

      return result;
    } catch (error) {
      throw new Error(`Error deleting category: ${error.message}`);
    }
  }
}

module.exports = CategoryRepository;
