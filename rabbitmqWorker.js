const { uploadVideoByIdService } = require("./services/VideoService");
const { consumeMessageFromQueue } = require("./utils/rabbitMq");

require("dotenv").config();

consumeMessageFromQueue(
  process.env.RABBITMQ_UPLOAD_VIDEO_QUEUE,
  uploadVideoByIdService
);

consumeMessageFromQueue("live_stream.connected");

consumeMessageFromQueue("live_stream.disconnected");

consumeMessageFromQueue("bunny_livestream_thumbnail");

module.exports = consumeMessageFromQueue;
