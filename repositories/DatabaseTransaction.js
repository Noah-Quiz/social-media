const BaseDatabaseTransaction = require("./BaseDatabaseTransaction.js");
const UserRepository = require("./UserRepository.js");
const VideoRepository = require("./VideoRepository.js");
class DatabaseTransaction extends BaseDatabaseTransaction {
  constructor() {
    super();
    this.userRepository = new UserRepository();
    this.videoRepository = new VideoRepository();
  }
}

module.exports = DatabaseTransaction;
