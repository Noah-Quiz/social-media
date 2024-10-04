const BaseDatabaseTransaction = require("./BaseDatabaseTransaction.js");
const UserRepository = require("./UserRepository.js");
const CategoryRepository = require("./CategoryRepository.js");
class DatabaseTransaction extends BaseDatabaseTransaction {
  constructor() {
    super();
    this.userRepository = new UserRepository();
    this.CategoryRepository = new CategoryRepository();
  }
}

module.exports = DatabaseTransaction;
