const getLogger = require("./logger");
const logger = getLogger("RABBITMQ");
const amqp = require("amqplib");
require("dotenv").config();
const path = require("path");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const { deleteCloudFlareStreamLiveInput } = require("../services/CloudFlareStreamService");

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
    connection = await amqp.connect(process.env.RABBITMQ_CONNECTION_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });

    channel.consume(
      queue,
      async (msg) => {
        if (msg) {
          try {
            const { live_input_id, streamOnlineUrl, streamServerUrl, thumbnailUrl } = JSON.parse(msg.content.toString());

            switch (queue) {
              case "bunny_video_dev_hung":
                const { bunnyId, videoFilePath } = JSON.parse(
                  msg.content.toString()
                );
                logger.info(`Path: ${videoFilePath}`);
                logger.info(
                  `Message received from queue ${queue}: ${msg.content.toString()}`
                );
                await callback(
                  process.env.BUNNY_STREAM_VIDEO_LIBRARY_ID,
                  bunnyId,
                  videoFilePath
                );
                logger.info(`Message processed successfully`);
                break;

              case "live_stream.connected":
                const connection = new DatabaseTransaction();

                const query = { uid: live_input_id };
                const stream = await connection.streamRepository.getStreamsRepository(query);
                if (!stream?.streams?.length === 0) {
                  throw new Error("Stream not found for given live input ID");
                }

                await connection.streamRepository.updateStreamRepository(stream.streams[0]?._id, { 
                  status: "live",
                  streamServerUrl
                });
                break;

              case "live_stream.disconnected":
                const connection2 = new DatabaseTransaction();
                const session = await connection2.startTransaction();

                try {
                  const query2 = { uid: live_input_id };
                  const stream2 = await connection2.streamRepository.getStreamsRepository(query2);
                  if (!stream2?.streams?.length === 0) {
                    throw new Error("Stream not found for given live input ID");
                  }

                  const updateData = {
                    rtmps: null,
                    rtmpsPlayback: null,
                    srt: null,
                    srtPlayback: null,
                    webRTC: null,
                    webRTCPlayback: null,
                    streamOnlineUrl,
                    uid: "",
                  };
                  await connection2.streamRepository.updateStreamRepository(stream2.streams[0]?._id, updateData, null, session);

                  await connection2.streamRepository.endStreamRepository(stream2.streams[0]?._id, session);
                  
                  await deleteCloudFlareStreamLiveInput(stream2.streams[0].uid);

                  connection2.commitTransaction();
                } catch (error) {
                  connection2.abortTransaction();
                } finally {
                  break;
                }

              case "bunny_livestream_thumbnail":
                const connection3 = new DatabaseTransaction();

                const query3 = { uid: live_input_id };
                const stream3 = await connection3.streamRepository.getStreamsRepository(query3);
                if (!stream3?.streams?.length === 0) {
                  throw new Error("Stream not found for given live input ID");
                }

                await connection3.streamRepository.updateStreamRepository(stream3.streams[0]?._id, { thumbnailUrl });
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
    logger.error(`Error while consuming message from queue ${queue}: ${error.stack}`);
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
