const amqp = require("amqplib");
const {
  topUpUserService,
  updateUserWalletService,
} = require("../services/UserService");
const { getExchangeRateService } = require("../services/ExchangeRateService");
const { createReceiptService } = require("../services/ReceiptService");

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const RABBITMQ_USER = process.env.RABBITMQ_USER;
const RABBITMQ_PASS = process.env.RABBITMQ_PASS;

const queue = "payment_queue"; // Main queue for payment tasks
const responseQueue = "response_queue"; // Queue to receive responses after processing

// Utility function to generate a unique correlation ID for messages
function generateUniqueId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Function to create a connection and channel for RabbitMQ
// Channels are required to publish and consume messages from the queues
async function createChannel() {
  try {
    // Establish connection to RabbitMQ using the provided credentials
    const connection = await amqp.connect({
      protocol: "amqp", // AMQP protocol for RabbitMQ
      hostname: RABBITMQ_URL, // RabbitMQ server hostname (IP or domain)
      username: RABBITMQ_USER, // RabbitMQ username
      password: RABBITMQ_PASS, // RabbitMQ password
    });

    // Create a channel, which is required for communication with RabbitMQ
    const channel = await connection.createChannel();
    return { connection, channel };
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error);
    throw new Error("RabbitMQ connection error");
  }
}

// Function to send a payment task to the payment queue (Producer)
// This is the message producer that sends tasks to RabbitMQ to be processed
exports.processPaymentQueue = async (userId, amount, params) => {
  console.log("Payment queue is called");

  try {
    // Create a RabbitMQ connection and channel
    const { connection, channel } = await createChannel();

    const paymentData = {
      userId,
      amount,
      params,
    };

    // Ensure the payment queue exists and is durable (persists on server restarts)
    await channel.assertQueue(queue, { durable: true });

    // Send the payment task (message) to the queue, using the Buffer to serialize the data
    await channel.sendToQueue(queue, Buffer.from(JSON.stringify(paymentData)), {
      persistent: true, // Ensure message persistence (survives RabbitMQ restarts)
      replyTo: responseQueue, // Indicate the queue to send responses to
      correlationId: generateUniqueId(), // Unique ID to match the response with the request
    });

    console.log("Payment task sent to queue:", paymentData);

    // Close the channel and connection after sending the message
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error sending payment task to queue:", error);
  }
};

// Function to consume payment tasks from the queue (Consumer)
// This is the message consumer that listens for new tasks on the payment queue
exports.consumePaymentQueue = async () => {
  console.log("consumePaymentQueue called");

  try {
    // Create a RabbitMQ connection and channel
    const { connection, channel } = await createChannel();

    // Ensure the payment queue exists and is durable
    await channel.assertQueue(queue, { durable: true });

    console.log(`Waiting for messages in ${queue}. To exit press CTRL+C`);

    // Set up a consumer that listens for messages in the payment queue
    channel.consume(
      queue,
      async (msg) => {
        if (msg !== null) {
          const paymentData = JSON.parse(msg.content.toString());
          const { userId, amount, params } = paymentData;

          try {
            // Fetch the current exchange rate and top-up the user's wallet
            const rate = await getExchangeRateService();
            const coin = await topUpUserService(userId, amount);

            // Create a receipt for the top-up
            const receipt = await createReceiptService({
              userId: userId,
              paymentMethod: params.paymentMethod || "N/A",
              paymentPort: params.paymentPort || "N/A",
              bankCode: params.bankCode || "N/A",
              amount: amount,
              transactionId: params.id,
              type: "TopUpBalance",
              exchangeRate: rate.topUpCoinRate,
            });

            if (!coin) {
              console.error(
                `Failed to top up user's balance for user ${userId}.`
              );
            }
            if (!receipt) {
              console.error(`Failed to create receipt for user ${userId}.`);
            }

            console.log(
              `Top-up successful for User ID: ${userId}, Amount: ${amount}`
            );

            // Send a success response to the response queue
            await channel.sendToQueue(
              responseQueue,
              Buffer.from(
                JSON.stringify({
                  status: "success",
                  message: `Top-up completed for User ID: ${userId}`,
                  userId,
                  amount,
                })
              ),
              {
                correlationId: msg.properties.correlationId, // Match response to request
              }
            );

            // Acknowledge the message, marking it as successfully processed
            channel.ack(msg);
          } catch (error) {
            console.error("Error processing top-up:", error);

            // Send an error response to the response queue
            await channel.sendToQueue(
              responseQueue,
              Buffer.from(
                JSON.stringify({
                  status: "error",
                  message: `Top-up failed for User ID: ${userId}`,
                  error: error.message,
                })
              ),
              {
                correlationId: msg.properties.correlationId, // Match response to request
              }
            );

            // Nack the message to indicate failure without re-queueing
            channel.nack(msg, false, false);
          }
        }
      },
      { noAck: false } // Enable explicit message acknowledgment
    );
  } catch (error) {
    console.error("Error consuming payment tasks:", error);
  }
};

// Function to consume responses from the response queue (Consumer)
// This consumer listens for responses in the response queue after tasks are processed
exports.consumeResponseQueue = async () => {
  console.log("consumeResponseQueue called");

  try {
    // Create a RabbitMQ connection and channel
    const { connection, channel } = await createChannel();

    // Ensure the response queue exists and is durable
    await channel.assertQueue(responseQueue, { durable: true });

    console.log(
      `Waiting for responses in ${responseQueue}. To exit press CTRL+C`
    );

    // Set up a consumer that listens for responses in the response queue
    channel.consume(
      responseQueue,
      (msg) => {
        if (msg !== null) {
          // Parse the response message and log it
          const response = JSON.parse(msg.content.toString());
          console.log("Received response from queue:", response);

          // Acknowledge the response message after processing
          channel.ack(msg);
        }
      },
      { noAck: false } // Enable explicit acknowledgment for responses
    );
  } catch (error) {
    console.error("Error consuming responses:", error);
  }
};
