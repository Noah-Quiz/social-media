require("dotenv").config();
const paypal = require("paypal-rest-sdk");
const { convertMoney } = require("../services/PaymentService");
const {
  processPaymentQueue,
  consumePaymentQueue,
  consumeResponseQueue,
} = require("../queues/paymentQueues");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
paypal.configure({
  mode: "sandbox",
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET_KEY,
});
class PaymentController {
  async payWithPayPalController(req, res) {
    const userId = req.userId;
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
                name: req.body.name || "Hat",
                sku: "001",
                price: req.body.price || "25.00",
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: req.body.price || "25.00",
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
            res.redirect(payment.links[i].href);
          }
        }
      }
    });
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
