const {
  signUp,
  login,
  loginGoogle,
  sendVerificationEmail,
  verifyEmail,
  loginApple,
  sendVerificationPhone,
  verifyPhone,
} = require("../services/AuthService");
const createAccessToken = require("../utils/createAccessToken");
require("dotenv").config();

class AuthController {
  async signUp(req, res) {
    const { fullName, email, phoneNumber, password } = req.body;
    try {
      const user = await signUp(fullName, email, phoneNumber, password);
      if (user) {
        await sendVerificationEmail(user.email);
      }
      res.status(201).json({ message: "Signup successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;

    try {
      const user = await login(email, password);
      const accessToken = createAccessToken(
        { _id: user._id, ip: ipAddress },
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRE
      );

      res.status(200).json({ accessToken, message: "Login successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async loginGoogle(req, res) {
    const googleUser = req.user;
    const ipAddress = req.ip || req.socket.remoteAddress;
    try {
      const user = await loginGoogle(googleUser);
      const accessToken = createAccessToken(
        { _id: user._id, ip: ipAddress },
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRE
      );
      res
        .status(200)
        .json({ accessToken, message: "Login with Google successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async loginApple(req, res) {
    const appleUser = JSON.parse(req.body.user);
    const ipAddress = req.ip || req.socket.remoteAddress;
    try {
      const user = await loginApple(appleUser);
      const accessToken = createAccessToken(
        { _id: user._id, ip: ipAddress },
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRE
      );
      res
        .status(200)
        .json({ accessToken, message: "Login with Apple successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async sendVerificationEmail(req, res) {
    const { email } = req.query;
    try {
      await sendVerificationEmail(email);
      res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async verifyEmail(req, res) {
    const { token } = req.query;
    try {
      const user = await verifyEmail(token);
      res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async sendVerificationPhone(req, res) {
    const { phoneNumber } = req.body;
    try {
      const status = await sendVerificationPhone(phoneNumber);
      res.status(200).json({ message: "SMS sent successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async verifyPhone(req, res) {
    const { phoneNumber, code } = req.body;
    try {
      const status = await verifyPhone(phoneNumber, code);
      res.status(200).json({ message: "Phone number verified successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = AuthController;
