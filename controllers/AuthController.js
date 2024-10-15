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
require("dotenv").config();

class AuthController {
  async signUpController(req, res) {
    try {
      const { fullName, email, phoneNumber, password } = req.body;
      const signupDto = new SignupDto(fullName, email, phoneNumber, password);
      await signupDto.validate();
      const user = await signUpService(fullName, email, phoneNumber, password);
      res
        .status(StatusCodeEnums.Created_201)
        .json({ message: "Signup successfully" });
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async loginController(req, res) {
    try {
      const { email, password } = req.body;
      const ipAddress =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress;

      const loginDto = new LoginDto(email, password);
      await loginDto.validate();

      const user = await loginService(email, password);
      const accessToken = createAccessToken(
        { _id: user._id, ip: ipAddress },
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRE
      );

      res
        .status(StatusCodeEnums.OK_200)
        .json({ accessToken, message: "Login successfully" });
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async loginGoogleController(req, res) {
    try {
      const googleUser = req.user;
      const ipAddress =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress;

      const loginGoogleDto = new LoginGoogleDto(
        googleUser.id,
        googleUser.email,
        googleUser.displayName,
        googleUser.avatar
      );
      await loginGoogleDto.validate();

      const user = await loginGoogleService(googleUser);
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

  async loginAppleController(req, res) {
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
      const loggedUser = await loginAppleService(user);
      const accessToken = createAccessToken(
        { _id: loggedUser._id, ip: ipAddress },
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRE
      );
      res
        .status(StatusCodeEnums.OK_200)
        .json({ accessToken, message: "Login with Apple successfully" });
    } catch (error) {
      return res
        .status(StatusCodeEnums.InternalServerError_500)
        .json({ message: error.message });
    }
  }

  async sendVerificationEmailController(req, res) {
    try {
      const { email } = req.params;
      const sendVerificationEmailDto = new SendVerificationEmailDto(email);
      await sendVerificationEmailDto.validate();

      await sendVerificationEmailService(email);
      res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Email sent successfully" });
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async verifyEmailController(req, res) {
    try {
      const { token } = req.query;
      const verifyEmailDto = new VerifyEmailDto(token);
      await verifyEmailDto.validate();

      const user = await verifyEmailService(token);
      res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async sendVerificationPhoneController(req, res) {
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
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async verifyPhoneController(req, res) {
    const { phoneNumber, code } = req.body;
    try {
      const status = await verifyPhoneService(phoneNumber, code);
      res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Phone number verified successfully" });
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async createResetPasswordTokenController(req, res) {
    try {
      const { email } = req.body;
      const createResetPasswordTokenDto = new CreateResetPasswordTokenDto(
        email
      );
      await createResetPasswordTokenDto.validate();

      const user = await createResetPasswordTokenService(email);
      if (user) {
        res
          .status(StatusCodeEnums.Created_201)
          .json({ message: "Reset password token created successfully" });
      }
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async resetPasswordController(req, res) {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      const user = await resetPasswordService(token, newPassword);
      if (user) {
        res
          .status(StatusCodeEnums.OK_200)
          .json({ message: "Reset password successfully  " });
      }
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }
}

module.exports = AuthController;
