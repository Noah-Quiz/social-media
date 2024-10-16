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
const GiftRepository = require("./GiftRepository.js");
const GiftHistoryRepository = require("./GiftHistoryRepository.js");
const ExchangeRateRepository = require("./ExchangeRateRepository.js");
const AdvertisementRepository = require("./AdvertisementRepository.js");
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
    this.giftRepository = new GiftRepository();
    this.giftHistoryRepository = new GiftHistoryRepository();
    this.exchangeRateRepository = new ExchangeRateRepository();
    this.advertisementRepository = new AdvertisementRepository();
  }
}

module.exports = DatabaseTransaction;
