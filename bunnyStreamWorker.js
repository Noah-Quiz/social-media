const {
  uploadBunnyStreamVideoService,
} = require("./services/BunnyStreamService");
const { consumeMessageFromQueue } = require("./utils/rabbitMq");

consumeMessageFromQueue(
  "bunny_video_dev_hung",
  uploadBunnyStreamVideoService
);
