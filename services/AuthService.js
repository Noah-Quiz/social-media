require("dotenv").config();
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailer = require("../utils/mailer");
const {
  sendVerificationCode,
  checkVerification,
} = require("../utils/phoneVerification");
const CoreException = require("../exceptions/CoreException");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const signUpService = async (
  fullName,
  email,
  phoneNumber,
  password,
  ipAddress
) => {
  try {
    const connection = new DatabaseTransaction();

    const existingEmail = await connection.userRepository.findUserByEmail(
      email
    );
    if (existingEmail)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Email is already registered"
      );

    const formattedPhoneNumber = phoneNumber.replace(/^0/, "+84");
    const existingPhone = await connection.userRepository.findUserByPhoneNumber(
      formattedPhoneNumber
    );
    if (existingPhone)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Phone number is already registered"
      );

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await connection.userRepository.createUser({
      fullName: fullName,
      email: email,
      phoneNumber: formattedPhoneNumber,
      password: hashedPassword,
      ipAddress: ipAddress,
    });

    return user;
  } catch (error) {
    throw error;
  }
};

const loginService = async (email, password, ipAddress) => {
  try {
    const connection = new DatabaseTransaction();

    const user = await connection.userRepository.findUserByEmail(email);
    if (!user)
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");

    // await checkIpAddressMismatch(user, ipAddress);

    if (user.isActive === false)
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "User is not active"
      );

    // Check if user is verified
    if (user.verify === false)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User is not verified. Please check your email or phone message for verification"
      );

    // Check if already login with google
    if (user.googleId !== "" && !user.password) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "You have already registered with Google. Please login with Google"
      );
    }
    if (user.appleUser === true && !user.password) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "You have already registered with Apple. Please login with Apple"
      );
    }

    const isPasswordMath = await bcrypt.compare(password, user.password);
    if (!isPasswordMath) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Password is incorrect"
      );
    }

    user.lastLogin = Date.now();
    await user.save();

    return user;
  } catch (error) {
    throw error;
  }
};

const loginGoogleService = async (user, ipAddress) => {
  try {
    const connection = new DatabaseTransaction();
    const existingUser = await connection.userRepository.findUserByEmail(
      user.emails[0].value
    );
    if (existingUser) {
      // await checkIpAddressMismatch(existingUser, ipAddress);

      if (existingUser.verify === false) {
        existingUser.verify = true;
      }
      if (existingUser.googleId === "") {
        existingUser.googleId = user.id;
      }
      if (existingUser.avatar === "") {
        existingUser.avatar = user.photos[0].value;
      }
      existingUser.lastLogin = Date.now();
      await existingUser.save();
      return existingUser;
    }
    const newUser = await connection.userRepository.createUser({
      fullName: user.displayName,
      email: user.emails[0].value,
      googleId: user.id,
      avatar: user.photos[0].value,
      verify: true,
    });
    return newUser;
  } catch (error) {
    throw new Error(`Error when login with Google: ${error.message}`);
  }
};
const loginAppleService = async (user, ipAddress) => {
  try {
    const connection = new DatabaseTransaction();
    const existingUser = await connection.userRepository.findUserByEmail(
      user.email
    );
    if (existingUser) {
      // await checkIpAddressMismatch(existingUser, ipAddress);
      
      if (existingUser.verify === false) {
        existingUser.verify = true;
      }
      if (existingUser.appleUser === false) {
        existingUser.appleUser = true;
      }
      existingUser.lastLogin = Date.now();
      await existingUser.save();
      return existingUser;
    }
    const newUser = await connection.userRepository.createUser({
      fullName: user.name,
      email: user.email,
      verify: true,
    });
    return newUser;
  } catch (error) {
    throw new Error(`Error when login with Apple: ${error.message}`);
  }
};

const checkIpAddressMismatch = async (user, ipAddress) => {
  try {
    const connection = new DatabaseTransaction();
    if (user.ipAddress !== ipAddress) {
      await connection.userRepository.updateAnUserByIdRepository(user._id, {
        verify: false,
        verifyToken: null,
        ipAddress: ipAddress,
      });
      await sendVerificationEmailService(user.email);
      throw new CoreException(
        StatusCodeEnums.Unauthorized_401,
        "Ip address is not match. We have sent you an email to verify your account again."
      );
    }
  } catch (error) {
    throw error;
  }
};

const sendVerificationEmailService = async (email) => {
  try {
    const connection = new DatabaseTransaction();

    const user = await connection.userRepository.findUserByEmail(email);
    if (!user)
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    if (user.verify === true)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User is already verified"
      );

    const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.EMAIL_VERIFICATION_EXPIRE || "1d",
    });
    user.verifyToken = token;
    await user.save();

    const mailBody = `
      <div style="width: 40vw;">
  <table>
    <tr>
      <td>
        <img src="https://amazingtech.vn/Content/amazingtech/assets/img/logo-color.png" width="350" alt="Logo" />
      </td>
    </tr>
    <tr>
      <td>
        <p>
          Thank you for signing up for the live stream application. Click the link below to fully access our app & activate your account and please note that your verification link will expire in 24 hours.
        </p>
      </td>
    </tr>
    <tr>
      <td>
        <a href="${process.env.APP_BASE_URL}/api/auth/verify/email?token=${token}">Click here to verify your email</a>
      </td>
    </tr>
    <tr>
      <td>
        <p style="color: grey;">Please check your spam folder if you don't see the email immediately</p>
      </td>
    </tr>
  </table>
</div>
    `;

    mailer.sendMail(
      email,
      "Email Verification",
      "Click the link below to verify your email",
      mailBody
    );
  } catch (error) {
    throw error;
  }
};

const verifyEmailService = async (token, res) => {
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const email = decodedToken.email;

    const connection = new DatabaseTransaction();
    const user = await connection.userRepository.findUserByEmail(email);
    if (!user || user.verifyToken !== token) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "Invalid token");
    }
    if (user.verify === true)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User is already verified"
      );

    user.verify = true;
    user.verifyToken = null;
    await user.save();
    return user;
  } catch (error) {
    throw error;
  }
};

const sendVerificationPhoneService = async (phoneNumber) => {
  try {
    const connection = new DatabaseTransaction();

    const user = await connection.userRepository.findUserByPhoneNumber(
      phoneNumber
    );
    if (!user)
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    if (user.verify === true)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User is already verified"
      );

    const status = await sendVerificationCode(phoneNumber);
    if (status !== "pending") {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "SMS failed");
    }

    return status;
  } catch (error) {
    throw error;
  }
};

const verifyPhoneService = async (phoneNumber, code) => {
  try {
    const connection = new DatabaseTransaction();
    const user = await connection.userRepository.findUserByPhoneNumber(
      phoneNumber
    );
    if (!user)
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    if (user.verify === true)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User is already verified"
      );

    const status = await checkVerification(phoneNumber, code);
    if (status !== "approved") {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "Invalid code");
    }

    user.verify = true;
    await user.save();

    return status;
  } catch (error) {
    throw error;
  }
};

const createResetPasswordTokenService = async (email) => {
  try {
    const connection = new DatabaseTransaction();
    const user = await connection.userRepository.findUserByEmail(email);
    if (!user)
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    if (user.verify === false)
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "User is not verified"
      );

    const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.RESET_PASSWORD_EXPIRE,
    });
    user.passwordResetToken = token;
    await user.save();

    const mailBody = `
    <div style="width: 40vw;">
<table>
  <tr>
    <td>
      <img src="https://amazingtech.vn/Content/amazingtech/assets/img/logo-color.png" width="350" alt="Logo" />
    </td>
  </tr>
  <tr>
    <td>
      <p>
        You have requested to reset your password, click the link below to reset your password. And please note that your link <strong>will be expired in 1 hour</strong> for security reasons.
      </p>
    </td>
  </tr>
  <tr>
    <td>
      <a href="http://localhost:4000/api/auth/reset-password/${token}">Click here to reset your password</a>
    </td>
  </tr> 
  <tr>
    <td>
      <p style="color: grey;">Please check your spam folder if you don't see the email immediately</p>
    </td>
  </tr>
</table>
</div>
  `;

    mailer.sendMail(
      email,
      "Reset your password",
      "Click the link below to reset your password",
      mailBody
    );
    return user;
  } catch (error) {
    throw error;
  }
};

const resetPasswordService = async (token, newPassword) => {
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const email = decodedToken.email;

    const connection = new DatabaseTransaction();
    const user = await connection.userRepository.findUserByEmail(email);

    if (!user || user.passwordResetToken !== token) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "Invalid token");
    }

    const salt = 10;
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    await user.save();

    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  signUpService,
  loginService,
  loginGoogleService,
  loginAppleService,
  sendVerificationEmailService,
  sendVerificationPhoneService,
  verifyPhoneService,
  verifyEmailService,
  createResetPasswordTokenService,
  resetPasswordService,
};
