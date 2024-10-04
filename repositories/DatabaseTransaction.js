const BaseDatabaseTransaction = require("./BaseDatabaseTransaction.js");
const MyPlaylistRepository = require("./MyPlaylistRepository.js");

class DatabaseTransaction extends BaseDatabaseTransaction {
  constructor() {
    super();
    this.myPlaylistRepository = new MyPlaylistRepository();
  }
}

module.exports = DatabaseTransaction;
