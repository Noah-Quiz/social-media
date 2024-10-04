const BaseDatabaseTransaction = require("./BaseDatabaseTransaction.js");
const UserRepository = require("./UserRepository.js");
class DatabaseTransaction extends BaseDatabaseTransaction {
  constructor() {
    super();
    this.userRepository = new UserRepository();
  }
}

module.exports = DatabaseTransaction;
