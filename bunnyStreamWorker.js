const {
  uploadBunnyStorageFileService,
} = require("./services/BunnyStreamService");
const { consumeMessageFromQueue } = require("./utils/rabbitMq");

consumeMessageFromQueue("bunny_video_dev_hung", uploadBunnyStorageFileService);

consumeMessageFromQueue("live_stream.connected");

consumeMessageFromQueue("live_stream.disconnected");

consumeMessageFromQueue("bunny_livestream_thumbnail");

