// controllers/PaymentController.js

const paypal = require("paypal-rest-sdk");
const paypalConfig = require("../configs/paypal.config");
const { convertMoney } = require("../services/PaymentService");
const {
  processPaymentQueue,
  consumePaymentQueue,
  consumeResponseQueue,
} = require("../queues/paymentQueues");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const PayWithPaypalDto = require("../dtos/Payment/PayWithPaypalDto");
const CoreException = require("../exceptions/CoreException");
const stripe = require("stripe")(
  "sk_test_51QMPvpP6v9wlQoaXtVPNg2OnszQ5KT5yheeJnV4M7I08EjHPQtmeIsmswPNfgNZhPhWX7joJfwJ8DszG3gpc17hG00rhkHZFeI"
);

paypal.configure({
  mode: paypalConfig.mode,
  client_id: paypalConfig.client_id,
  client_secret: paypalConfig.client_secret,
});

class PaymentController {
  async payWithStripeController(req, res, next) {
    req.session.amount=3000;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "T-shirt",
            },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:4000/api/payments/stripe/success",
      cancel_url: "http://localhost:4000/api/payments/stripe/cancel",
    });
    return res.status(StatusCodeEnums.OK_200).json({ url: session.url });
  }

  async successStripeController(req, res) {
    res
      .status(StatusCodeEnums.OK_200)
      .json({ body: req.body, query: req.query, params: req.params, amount: req.session.amount });
  }

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
        redirect_urls: paypalConfig.redirect_urls, // Use dynamic URLs from config
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
