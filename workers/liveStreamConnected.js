const { consumeMessageFromQueue } = require("../utils/rabbitMq");

consumeMessageFromQueue("cloudflare.live_input");