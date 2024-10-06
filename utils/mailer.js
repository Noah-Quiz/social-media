const nodemailer = require("nodemailer");
require("dotenv").config();
const sendMail = (to, subject, text, html) => {
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_AUTH_USER,
      pass: process.env.MAIL_AUTH_PASSWORD,
    },
  });
  const options = {
    from: process.env.MAIL_AUTH_USER,
    to: to,
    subject: subject,
    text: text,
    html: html,
  };
  return transport.sendMail(options);
};

module.exports = {sendMail};
