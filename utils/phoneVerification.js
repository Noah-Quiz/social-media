require("dotenv").config();

const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendVerificationCode = async (phoneNumber) => {
  try {
    const data = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: phoneNumber,
        channel: "sms",
      });
    return data.status;
  } catch (error) {
    console.error("Error sending verification code:", error);
    throw error;
  }
};

const checkVerification = async (phoneNumber, code) => {
  try {
    const data = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: phoneNumber,
        code: code,
      });
    return data.status;
  } catch (error) {
    console.error("Error checking verification code:", error);
    throw error;
  }
};

module.exports = { sendVerificationCode, checkVerification };
