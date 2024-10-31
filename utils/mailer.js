const nodemailer = require("nodemailer");
const getLogger = require("./logger");
const logger = getLogger("MAIL");
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
  return transport
    .sendMail(options)
    .then((info) => {
      logger.info(`Email sent: ${info.response}`);
    })
    .catch((error) => {
      logger.error(`Error sending email: ${error}`);
    });
};

module.exports = { sendMail };
