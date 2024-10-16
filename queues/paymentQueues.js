const amqp = require("amqplib/callback_api");
const {
  topUpUserService,
  updateUserWalletService,
} = require("../services/UserService");
const { getExchangeRateService } = require("../services/ExchangeRateService");
const { createReceiptService } = require("../services/ReceiptService");
const RABBITMQ_URL = process.env.RABBITMQ_URL;

const queue = "payment_queue";
// Main queue for payment tasks
const responseQueue = "response_queue";
// Queue to receive the response

// Function to send payment task to the queue (Producer)
exports.processPaymentQueue = async (userId, amount, vnp_Params) => {
  console.log("payment_queue is called, ", RABBITMQ_URL);

  // Connect to RabbitMQ server
  amqp.connect(RABBITMQ_URL, (error0, connection) => {
    if (error0) {
      throw new Error("Failed to connect to RabbitMQ:", error0);
    }

    // Create a channel for communication
    connection.createChannel((error1, channel) => {
      if (error1) {
        throw new Error("Failed to create channel:", error1);
      }

      const paymentData = {
        userId,
        amount,
        vnp_Params,
      };

      // Assert queue (ensure the queue exists, durable = true makes sure it survives server restarts)
      channel.assertQueue(queue, { durable: true });

      // Send message to the queue
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(paymentData)), {
        persistent: true,
        replyTo: responseQueue,
        correlationId: generateUniqueId(),
      });

      console.log("Payment task sent to queue:", paymentData);
    });
  });
};

// Function to consume payment tasks from the queue (Consumer)
exports.consumePaymentQueue = () => {
  console.log("consume");

  // Connect to RabbitMQ server
  amqp.connect(RABBITMQ_URL, (error0, connection) => {
    if (error0) {
      throw new Error("Failed to connect to RabbitMQ:", error0);
    }

    // Create a channel for communication
    connection.createChannel((error1, channel) => {
      if (error1) {
        throw new Error("Failed to create channel:", error1);
      }

      // Assert the queue exists (creating it if it doesn't)
      channel.assertQueue(queue, { durable: true });

      console.log(`Waiting for messages in ${queue}. To exit press CTRL+C`);

      // Consume payment tasks
      channel.consume(
        queue,
        async (msg) => {
          if (msg !== null) {
            const paymentData = JSON.parse(msg.content.toString());
            const { userId, amount, vnp_Params } = paymentData; // Only focusing on top-up

            try {
              // 1. Top up user's coin with the rate
              const rate = await getExchangeRateService();
              const coin = await updateUserWalletService(
                userId,
                "ReceiveCoin",
                amount * rate.topUpCoinRate
              );

              //2. Create receipt for top up
              const receipt = await createReceiptService(
                userId,
                vnp_Params.vnp_CardType,
                "VNPAY",
                vnp_Params.vnp_BankCode,
                amount,
                vnp_Params.vnp_TxnRef,
                "TopUpCoin",
                (exchangeRate = rate.topUpCoinRate)
              );

              if (!coin) {
                console.log(
                  `Failed to top up user's balance for user ${userId}.`
                );
              }
              if (!receipt) {
                console.log(`Failed to create receipt for user ${userId}.`);
              }
              console.log(
                `Top-up successful for User ID: ${userId}, Amount: ${amount}`
              );

              // Send a response message back to the response queue
              channel.sendToQueue(
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
                  correlationId: msg.properties.correlationId,
                }
              );

              // Acknowledge message after processing
              channel.ack(msg);
            } catch (error) {
              console.error("Error processing top-up:", error);

              // Send error response back to the response queue
              channel.sendToQueue(
                responseQueue,
                Buffer.from(
                  JSON.stringify({
                    status: "error",
                    message: `Top-up failed for User ID: ${userId}`,
                    error: error.message,
                  })
                ),
                {
                  correlationId: msg.properties.correlationId,
                }
              );
            }
          }
        },
        { noAck: false }
      );
    });
  });
};

// Function to consume responses from the response queue (Consumer)
exports.consumeResponseQueue = () => {
  console.log("consumeResponseQueue");

  // Connect to RabbitMQ server
  amqp.connect(RABBITMQ_URL, (error0, connection) => {
    if (error0) {
      throw new Error("Failed to connect to RabbitMQ:", error0);
    }

    // Create a channel for communication
    connection.createChannel((error1, channel) => {
      if (error1) {
        throw new Error("Failed to create channel:", error1);
      }

      // Assert the response queue exists
      channel.assertQueue(responseQueue, { durable: true });

      console.log(
        `Waiting for responses in ${responseQueue}. To exit press CTRL+C`
      );

      // Consume response messages
      channel.consume(
        responseQueue,
        (msg) => {
          if (msg !== null) {
            const response = JSON.parse(msg.content.toString());
            console.log("Received response from queue:", response);

            // Acknowledge the response message after processing
            channel.ack(msg);
          }
        },
        { noAck: false }
      );
    });
  });
};

// Utility function to generate a unique correlation ID
function generateUniqueId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
