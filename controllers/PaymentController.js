const paypal = require("paypal-rest-sdk");
paypal.configure({
  mode: "sandbox",
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET_KEY,
});
class PaymentController {
  async payWithPayPalController(req, res) {
    const userId =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzBmM2M5MjFiOWRiZDhkNmVhMTgzZjciLCJpcCI6Ijo6MSIsImlhdCI6MTcyOTc0MDE2MSwiZXhwIjoxNzI5NzYxNzYxfQ.9US6JVWg9HMAFzGC6cM6Aia_XNIP2zFBlrNmMZtTZPA";
    req.session.userId = userId;

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:4000/api/payment/paypal/success",
        cancel_url: "http://localhost:4000/api/payment/paypal/cancel",
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
      //   transactions: [
      //     {
      //       amount: {
      //         currency: "USD",
      //         total: "25.00",
      //       },
      //     },
      //   ],
    };

    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      function (error, payment) {
        if (error) {
          console.log(error.response);
          throw error;
        } else {
          console.log(payment);
          console.log(payment.transactions[0].amount.total);
          res.send("Success");
        }
      }
    );
  }
}

module.exports = PaymentController;
