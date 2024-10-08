require("dotenv").config();

const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendVerificationCode = async (phoneNumber) => {
  const data = await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({
      to: phoneNumber,
      channel: "sms",
    });
  return data.status;
};

const checkVerification = async (phoneNumber, code) => {
  return client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({
      to: phoneNumber,
      code: code,
    })
    .then((data) => {
      return data.status;
    });
};

module.exports = { sendVerificationCode, checkVerification };
