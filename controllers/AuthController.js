const {
  signUp,
  login,
  loginGoogle,
  sendVerificationEmail,
  verifyEmail,
  loginApple,
  sendVerificationPhone,
  verifyPhone,
  createResetPasswordToken,
  resetPassword,
} = require("../services/AuthService");
const createAccessToken = require("../utils/createAccessToken");
const passport = require("passport");
const verifyAppleToken = require("verify-apple-id-token").default;
const jwt = require("jsonwebtoken");
require("dotenv").config();

class AuthController {
  async signUp(req, res) {
    const { fullName, email, phoneNumber, password } = req.body;
    try {
      const user = await signUp(fullName, email, phoneNumber, password);
      res.status(201).json({ message: "Signup successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;
    const ipAddress =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;

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
    const ipAddress =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;
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

  async loginApple(req, res, next) {
    try {
      const user = {
        email: "",
        name: "",
      };
      if (req.body.user) {
        user.email = JSON.parse(req.body.user.email);
        user.name = JSON.parse(
          req.body.user.name.firstName + " " + req.body.user.name.lastName
        );
      } else {
        const jwtClaims = await verifyAppleToken({
          idToken: req.body.id_token,
          clientId: process.env.APPLE_CLIENT_ID,
        });
        user.email = jwtClaims.email;
      }

      const ipAddress =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      const loggedUser = await loginApple(user);
      const accessToken = createAccessToken(
        { _id: loggedUser._id, ip: ipAddress },
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

  async createResetPasswordToken(req, res) {
    const { email } = req.body;
    try {
      const user = await createResetPasswordToken(email);
      if (user) {
        res
          .status(201)
          .json({ message: "Reset password token created successfully" });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async resetPassword(req, res) {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
      const user = await resetPassword(token, newPassword);
      if (user) {
        res.status(200).json({ message: "Reset password successfully  " });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = AuthController;
