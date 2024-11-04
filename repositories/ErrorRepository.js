const Error = require("../entities/ErrorEntity");

class ErrorRepository {
  async getErrorsRepository() {
    try {
      let errors = await Error.find({ isDeleted: false })
        .sort({ dateCreated: -1 })
        .lean();

      // Remove unwanted fields from each error
      errors = errors.map((error) => {
        delete error.__v;
        delete error.lastUpdated;
        delete error.isDeleted;
        return error;
      });

      return errors;
    } catch (error) {
      throw new Error(`Error getting all errors: ${error.message}`);
    }
  }

  async createErrorRepository(errorData) {
    try {
      const error = await Error.create(errorData);
      const result = error.toObject();

      // Remove unwanted fields
      delete result.__v;
      delete result.lastUpdated;
      delete result.isDeleted;

      return result;
    } catch (error) {
      throw new Error(`Error creating error: ${error.message}`);
    }
  }
}

module.exports = ErrorRepository;
