const BaseDatabaseTransaction = require("./BaseDatabaseTransaction.js");
const UserRepository = require("./UserRepository.js");
const CategoryRepository = require("./CategoryRepository.js");
const MyPlaylistRepository = require("./MyPlaylistRepository.js");
const MessageRepository = require("./MessageRepository.js");
const VideoRepository = require("./VideoRepository.js");
const RoomRepository = require("./RoomRepository.js");
const CommentRepository = require("./CommentRepository.js");
const ReceiptRepository = require("./ReceiptRepository.js");
const HistoryRepository = require("./HistoryRepository.js");
const StreamRepository = require("./StreamRepository.js");
class DatabaseTransaction extends BaseDatabaseTransaction {
  constructor() {
    super();
    this.userRepository = new UserRepository();
    this.categoryRepository = new CategoryRepository();
    this.myPlaylistRepository = new MyPlaylistRepository();
    this.messageRepository = new MessageRepository();
    this.videoRepository = new VideoRepository();
    this.roomRepository = new RoomRepository();
    this.commentRepository = new CommentRepository();
    this.receiptRepository = new ReceiptRepository();
    this.historyRepository = new HistoryRepository();
    this.streamRepository = new StreamRepository();
  }
}

module.exports = DatabaseTransaction;
