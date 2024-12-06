// config/paypal.config.js

require("dotenv").config();

const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:4000";

module.exports = {
  mode: "sandbox",
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET_KEY,
  redirect_urls: {
    return_url: `${APP_BASE_URL}/api/payments/paypal/success`, //thêm s
    cancel_url: `${APP_BASE_URL}/api/payments/paypal/cancel`, //thêm s
  },
};
