const BaseDatabaseTransaction = require("./BaseDatabaseTransaction.js");
const UserRepository = require("./UserRepository.js");
const CategoryRepository = require("./CategoryRepository.js");
const MyPlaylistRepository = require("./MyPlaylistRepository.js");
const MessageRepository = require("./MessageRepository.js");
class DatabaseTransaction extends BaseDatabaseTransaction {
  constructor() {
    super();
    this.userRepository = new UserRepository();
    this.categoryRepository = new CategoryRepository();
    this.myPlaylistRepository = new MyPlaylistRepository();
    this.messageRepository = new MessageRepository();
  }
}

module.exports = DatabaseTransaction;
