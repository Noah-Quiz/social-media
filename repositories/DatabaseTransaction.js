const BaseDatabaseTransaction = require("./BaseDatabaseTransaction.js");
const CategoryRepository = require("./CategoryRepository.js");
class DatabaseTransaction extends BaseDatabaseTransaction {
  constructor() {
    super();
    this.CategoryRepository = new CategoryRepository();
  }
}

module.exports = DatabaseTransaction;
