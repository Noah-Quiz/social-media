const getLogger = require("./logger");
const logger = getLogger("RABBITMQ");
const amqp = require("amqplib");
require("dotenv").config();
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const eventEmitter = require("../socket/events");

async function sendMessageToQueue(queue, message) {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_CONNECTION_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
    logger.info(`Message sent to queue ${queue}`);
    await channel.close();
    await connection.close();
  } catch (error) {
    logger.error(`Error while sending message to queue ${queue}: ${error}`);
  }
}

async function consumeMessageFromQueue(queue, callback) {
  logger.info(`Consuming message from queue ${queue}`);
  let connection;
  let channel;

  try {
    connection = await amqp.connect(process.env.RABBITMQ_CONNECTION_URL, {
      heartbeat: 30,
    });
    connection.on("error", (error) => {
      logger.error(`RabbitMQ connection error: ${error}`);
      if (error.code === "ECONNRESET") {
        logger.warn("ECONNRESET detected, reconnecting...");
      }
    });
    connection.on("close", async () => {
      logger.warn("RabbitMQ connection closed, attempting reconnection...");
      setTimeout(consumeMessageFromQueue, 5000); // Retry connection after delay
    });

    channel = await connection.createChannel();
    channel.on("error", (error) => {
      channel.on("error", (error) => {
        logger.error(`Channel error: ${error}`);
      });

      // Reconnect the channel if it closes unexpectedly
      channel.on("close", async () => {
        logger.warn("Channel closed, attempting to recreate...");
        setTimeout(consumeMessageFromQueue, 5000); // Retry connection after delay
      });
    });
    await channel.assertQueue(queue, { durable: true });

    channel.consume(
      queue,
      async (msg) => {
        if (msg) {
          try {
            const {
              live_input_id,
              streamOnlineUrl,
              streamServerUrl,
              thumbnailUrl,
            } = JSON.parse(msg.content?.toString());

            switch (queue) {
              case process.env.RABBITMQ_UPLOAD_VIDEO_QUEUE:
                const { userId, videoId, videoFolderPath } = JSON.parse(
                  msg.content?.toString()
                );
                logger.info(`Path: ${videoFolderPath}`);
                logger.info(
                  `Message received from queue ${queue}: ${msg.content?.toString()}`
                );
                await callback({
                  userId: userId,
                  videoId: videoId,
                  videoFolderPath: videoFolderPath,
                });
                logger.info(`Message processed successfully`);
                break;

              case "live_stream.connected":
                logger.info("Consuming live stream connect event");
                const connection = new DatabaseTransaction();
                const session = await connection.startTransaction();

                try {
                  const uid = live_input_id || null;
                  const stream =
                    await connection.streamRepository.getStreamByCloudflareId(
                      uid
                    );
                  if (!stream) {
                    throw new Error("Stream not found for given live input ID");
                  }

                  const result =
                    await connection.streamRepository.updateStreamRepository(
                      stream._id,
                      {
                        status: "live",
                        streamServerUrl,
                      },
                      null,
                      session
                    );
                  if (result) {
                    eventEmitter.emit("live_stream_connected", {
                      streamId: result._id,
                      streamServerUrl: result.streamServerUrl,
                    });
                  }

                  connection.commitTransaction();
                } catch (error) {
                  connection.abortTransaction();
                } finally {
                  break;
                }

              case "live_stream.disconnected":
                logger.info("Consuming live stream disconnect event");
                const connection2 = new DatabaseTransaction();
                const session2 = await connection2.startTransaction();

                try {
                  const uid = live_input_id || null;
                  const stream2 =
                    await connection2.streamRepository.getStreamByCloudflareId(
                      uid
                    );
                  if (!stream2) {
                    throw new Error("Stream not found for given live input ID");
                  }

                  const updateData = {
                    streamOnlineUrl,
                    status: "offline",
                    endedAt: Date.now(),
                    lastUpdated: Date.now(),
                  };

                  await connection2.streamRepository.updateStreamRepository(
                    stream2._id,
                    updateData,
                    null,
                    session2
                  );

                  connection2.commitTransaction();
                } catch (error) {
                  connection2.abortTransaction();
                } finally {
                  break;
                }

              case "bunny_livestream_thumbnail":
                logger.info("Consuming live stream thumbnail event");
                const connection3 = new DatabaseTransaction();

                const uid = live_input_id || null;
                const stream3 =
                  await connection3.streamRepository.getStreamByCloudflareId(
                    uid
                  );
                if (!stream3) {
                  throw new Error("Stream not found for given live input ID");
                }

                await connection3.streamRepository.updateStreamRepository(
                  stream3._id,
                  { thumbnailUrl }
                );
                break;
              default:
                logger.warn("No matching queue found");
                break;
            }

            channel.ack(msg);
          } catch (error) {
            logger.error(`Error while processing message: ${error}`);
            channel.nack(msg, true, false);
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    logger.error(
      `Error while consuming message from queue ${queue}: ${error.stack}`
    );
  } finally {
    // Optional: Clean up the connection and channel when you're done
    process.on("SIGINT", async () => {
      if (channel) {
        await channel.close();
      }
      if (connection) {
        await connection.close();
      }
      logger.info("RabbitMQ connection closed.");
      process.exit(0);
    });
  }
}

module.exports = {
  sendMessageToQueue,
  consumeMessageFromQueue,
};
