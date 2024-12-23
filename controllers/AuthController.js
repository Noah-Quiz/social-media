const {
  signUpService,
  loginService,
  loginGoogleService,
  sendVerificationEmailService,
  verifyEmailService,
  loginAppleService,
  sendVerificationPhoneService,
  verifyPhoneService,
  createResetPasswordTokenService,
  resetPasswordService,
  checkAccessTokenExpiredService,
} = require("../services/AuthService");
const createAccessToken = require("../utils/createAccessToken");
const passport = require("passport");
const verifyAppleToken = require("verify-apple-id-token").default;
const jwt = require("jsonwebtoken");
const LoginDto = require("../dtos/Auth/LoginDto");
const SignupDto = require("../dtos/Auth/SignupDto");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const SendVerificationEmailDto = require("../dtos/Auth/SendVerificationEmailDto");
const SendVerificationPhoneDto = require("../dtos/Auth/SendVerificationPhoneDto");
const CreateResetPasswordTokenDto = require("../dtos/Auth/CreateResetPasswordTokenDto");
const LoginGoogleDto = require("../dtos/Auth/LoginGoogleDto");
const LoginAppleDto = require("../dtos/Auth/LoginAppleDto");
const VerifyEmailDto = require("../dtos/Auth/VerifyEmailDto");
const ResetPasswordDto = require("../dtos/Auth/ResetPasswordDto");
require("dotenv").config();

class AuthController {
  async signUpController(req, res, next) {
    try {
      const { fullName, email, phoneNumber, password } = req.body;
      const signupDto = new SignupDto(fullName, email, phoneNumber, password);
      await signupDto.validate();

      const ipAddress = req.ip?.replace(/^.*:/, ""); //->192.168.0.101

      const user = await signUpService(
        fullName,
        email,
        phoneNumber,
        password,
        ipAddress
      );
      res
        .status(StatusCodeEnums.Created_201)
        .json({ message: "Signup successfully" });
    } catch (error) {
      next(error);
    }
  }

  async loginController(req, res, next) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip?.replace(/^.*:/, ""); //->192.168.0.101

      const loginDto = new LoginDto(email, password);
      await loginDto.validate();

      const user = await loginService(email, password, ipAddress);
      const accessToken = createAccessToken(
        { _id: user._id, ip: ipAddress },
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRE
      );
      res
        .status(StatusCodeEnums.OK_200)
        .json({ accessToken, userId: user._id, message: "Login successfully" });
    } catch (error) {
      next(error);
    }
  }

  async loginGoogleController(req, res, next) {
    try {
      const googleUser = req.user._json;
      const ipAddress = req.ip?.replace(/^.*:/, ""); //->192.168.0.101

      const user = await loginGoogleService(googleUser, ipAddress);
      const accessToken = createAccessToken(
        { _id: user._id, ip: ipAddress },
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRE
      );
      res.redirect(
        `http://localhost:3001?accessToken=${accessToken}&userId=${user._id}`
      );
    } catch (error) {
      next(error);
    }
  }

  async loginGoogleFromMobileController(req, res, next) {
    try {
      const googleUser = req.body;
      const ipAddress = req.ip?.replace(/^.*:/, ""); //->192.168.0.101

      const user = await loginGoogleService(googleUser, ipAddress);
      const accessToken = createAccessToken(
        { _id: user._id, ip: ipAddress },
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRE
      );
      res.status(StatusCodeEnums.OK_200).json({
        accessToken,
        userId: user._id,
        message: "Login with Google successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async loginAppleController(req, res, next) {
    try {
      const loginAppleDtoIdToken = new LoginAppleDto(req.body.id_token);
      await loginAppleDtoIdToken.validate();

      const user = {
        email: "",
        name: "",
      };
      if (req.body.user) {
        const userData = JSON.parse(req.body.user);
        user.email = userData.email;
        user.name = userData.name.firstName + " " + userData.name.lastName;
      } else {
        const jwtClaims = await verifyAppleToken({
          idToken: req.body.id_token,
          clientId: process.env.APPLE_CLIENT_ID,
        });
        user.email = jwtClaims.email;
      }

      const ipAddress =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      const loggedUser = await loginAppleService(user, ipAddress);
      const accessToken = createAccessToken(
        { _id: loggedUser._id, ip: ipAddress },
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRE
      );
      // res
      //   .status(StatusCodeEnums.OK_200)
      //   .json({ accessToken, message: "Login with Apple successfully" });
      res.redirect(
        `http://localhost:3001?accessToken=${accessToken}&userId=${loggedUser._id}`
      );
    } catch (error) {
      next(error);
    }
  }

  async sendVerificationEmailController(req, res, next) {
    try {
      const { email } = req.params;
      const sendVerificationEmailDto = new SendVerificationEmailDto(email);
      await sendVerificationEmailDto.validate();

      await sendVerificationEmailService(email);
      res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Email sent successfully" });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmailController(req, res, next) {
    try {
      const { token } = req.query;
      const verifyEmailDto = new VerifyEmailDto(token);
      await verifyEmailDto.validate();

      const user = await verifyEmailService(token);
      res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      next(error);
    }
  }

  async sendVerificationPhoneController(req, res, next) {
    try {
      const { phoneNumber } = req.body;
      const sendVerificationPhoneDto = new SendVerificationPhoneDto(
        phoneNumber
      );
      await sendVerificationPhoneDto.validate();
      const status = await sendVerificationPhoneService(phoneNumber);
      res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "SMS sent successfully" });
    } catch (error) {
      next(error);
    }
  }

  async verifyPhoneController(req, res, next) {
    const { phoneNumber, code } = req.body;
    try {
      const status = await verifyPhoneService(phoneNumber, code);
      res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Phone number verified successfully" });
    } catch (error) {
      next(error);
    }
  }

  async createResetPasswordTokenController(req, res, next) {
    try {
      const { email } = req.body;
      const createResetPasswordTokenDto = new CreateResetPasswordTokenDto(
        email
      );
      await createResetPasswordTokenDto.validate();

      const token = await createResetPasswordTokenService(email);
      if (token) {
        res.status(StatusCodeEnums.Created_201).json({
          message: "We have sent an reset password link to your email!",
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async resetPasswordController(req, res, next) {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;
      const resetPasswordDto = new ResetPasswordDto(newPassword);
      try {
        await resetPasswordDto.validate();
      } catch (error) {
        throw new Error(error.message);
      }
      const user = await resetPasswordService(token, newPassword);
      if (user) {
        res
          .status(StatusCodeEnums.OK_200)
          .json({ message: "Reset password successfully!" });
      }
    } catch (error) {
      next(error);
    }
  }

  async checkAccessTokenExpiredController(req, res, next) {
    try {
      const { accessToken } = req.body;
      await checkAccessTokenExpiredService(accessToken);
      res.status(StatusCodeEnums.OK_200).json({
        message: "Access token is valid",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
