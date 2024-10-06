const BaseDatabaseTransaction = require("./BaseDatabaseTransaction.js");
const UserRepository = require("./UserRepository.js");
const CategoryRepository = require("./CategoryRepository.js");
const MessageRepository = require("./MessageRepository.js");
class DatabaseTransaction extends BaseDatabaseTransaction {
  constructor() {
    super();
    this.userRepository = new UserRepository();
    this.CategoryRepository = new CategoryRepository();
    this.MessageRepository = new MessageRepository();
  }
}

module.exports = DatabaseTransaction;
