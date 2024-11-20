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
const AdvertisementPackageRepository = require("./AdvertisementPackageRepository.js");
const MemberPackRepository = require("./MemberPackRepository.js");
const MemberGroupRepository = require("./MemberGroupRepository.js");
const ErrorRepository = require("./ErrorRepository.js");
const VipPackageRepository = require("./VipPackageRepository.js");
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
    this.advertisementPackageRepository = new AdvertisementPackageRepository();
    this.memberPackRepository = new MemberPackRepository();
    this.memberGroupRepository = new MemberGroupRepository();
    this.errorRepository = new ErrorRepository();
    this.vipPackageRepository = new VipPackageRepository();
  }
}

module.exports = DatabaseTransaction;
