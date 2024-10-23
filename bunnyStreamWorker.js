const {
  uploadBunnyStreamVideoService,
} = require("./services/BunnyStreamService");
const { consumeMessageFromQueue } = require("./utils/rabbitMq");

consumeMessageFromQueue(
  "bunny_video_dev_hung",
  uploadBunnyStreamVideoService
);

consumeMessageFromQueue("live_stream.connected");

consumeMessageFromQueue("live_stream.disconnected");

consumeMessageFromQueue("bunny_livestream_thumbnail");