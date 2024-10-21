const { consumeMessageFromQueue } = require("./utils/rabbitMq");

consumeMessageFromQueue("live_stream.disconnected");