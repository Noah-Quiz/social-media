require("dotenv").config();
const paypal = require("paypal-rest-sdk");
const { convertMoney } = require("../services/PaymentService");
const {
  processPaymentQueue,
  consumePaymentQueue,
  consumeResponseQueue,
} = require("../queues/paymentQueues");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const PayWithPaypalDto = require("../dtos/Payment/PayWithPaypalDto");
const CoreException = require("../exceptions/CoreException");
paypal.configure({
  mode: "sandbox",
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET_KEY,
});
class PaymentController {
  async payWithPayPalController(req, res, next) {
    try {
      const userId = req.userId;
      const { price } = req.body;
      const payWithPaypalDto = new PayWithPaypalDto(price);
      await payWithPaypalDto.validate();

      req.session.userId = userId;

      const create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: process.env.PAYPAL_SUCCESS_URL,
          cancel_url: process.env.PAYPAL_CANCEL_URL,
        },
        transactions: [
          {
            item_list: {
              items: [
                {
                  name: "Social Media",
                  sku: "001",
                  price: price || "25.00",
                  currency: "USD",
                  quantity: 1,
                },
              ],
            },
            amount: {
              currency: "USD",
              total: price || "25.00",
            },
            description: "This is the payment description.",
          },
        ],
      };
      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === "approval_url") {
              res.status(StatusCodeEnums.OK_200).json({
                link: payment.links[i].href,
              });
            }
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async successPayPalController(req, res) {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const userId = req.session.userId;
    const execute_payment_json = {
      payer_id: payerId,
    };

    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      async function (error, payment) {
        if (error) {
          console.log(error.response);
          throw error;
        } else {
          const amountInVnd = await convertMoney(
            Number(payment.transactions[0].amount.total),
            "USD",
            "VND"
          );
          const paymentParams = {
            id: payment.id,
            paymentMethod: "PAYPAL",
            paymentPort: "PAYPAL",
          };
          await processPaymentQueue(userId, amountInVnd, paymentParams);
          await consumePaymentQueue();
          await consumeResponseQueue();
          res
            .status(StatusCodeEnums.OK_200)
            .json({ message: "Payment successfully." });
        }
      }
    );
  }

  async cancelPayPalController(req, res) {
    res.status(StatusCodeEnums.BadRequest_400).json({
      message: "Payment failed.",
    });
  }
}

module.exports = PaymentController;
