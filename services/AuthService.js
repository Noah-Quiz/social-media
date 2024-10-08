const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  validEmail,
  validPassword,
  validPhoneNumber,
} = require("../utils/validator");
const mailer = require("../utils/mailer");
const {
  sendVerificationCode,
  checkVerification,
} = require("../utils/phoneVerification");
const signUp = async (fullName, email, phoneNumber, password) => {
  try {
    const connection = new DatabaseTransaction();

    validEmail(email);
    validPassword(password);
    validPhoneNumber(phoneNumber);

    const existingEmail = await connection.userRepository.findUserByEmail(
      email
    );
    if (existingEmail) throw new Error("Email is already registered");

    const existingPhone = await connection.userRepository.findUserByPhoneNumber(
      phoneNumber
    );
    if (existingPhone) throw new Error("Phone is already registered");

    const formattedPhoneNumber = phoneNumber.replace(/^0/, "+84");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await connection.userRepository.createUser({
      fullName: fullName,
      email: email,
      phoneNumber: formattedPhoneNumber,
      password: hashedPassword,
    });

    return user;
  } catch (error) {
    throw new Error(`Error when signing up: ${error.message}`);
  }
};

const login = async (email, password) => {
  try {
    const connection = new DatabaseTransaction();

    validEmail(email);

    const user = await connection.userRepository.findUserByEmail(email);
    if (user.isActive === false) throw new Error("User is not active");
    if (!user) throw new Error("User not found");

    const isPasswordMath = bcrypt.compare(password, user.password);
    if (!isPasswordMath) {
      throw new Error("Password is incorrect");
    }

    user.lastLogin = Date.now();
    await user.save();

    return user;
  } catch (error) {
    throw new Error(`Error when login: ${error.message}`);
  }
};

const loginGoogle = async (user) => {
  try {
    const connection = new DatabaseTransaction();
    const existingUser = await connection.userRepository.findUserByEmail(
      user.emails[0].value
    );
    if (existingUser) {
      if (existingUser.isActive === false) {
        existingUser.isActive = true;
        await existingUser.save();
      }
      if (existingUser.verify === false) {
        existingUser.verify = true;
        await existingUser.save();
      }
      if (existingUser.googleId === "") {
        existingUser.googleId = user.id;
        await existingUser.save();
      }
      if (existingUser.avatar === "") {
        existingUser.avatar = user.photos[0].value;
        await existingUser.save();
      }
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
const loginApple = async (user) => {
  try {
    const connection = new DatabaseTransaction();
    const existingUser = await connection.userRepository.findUserByEmail(
      user.email
    );
    if (existingUser) {
      if (existingUser.isActive === false) {
        existingUser.isActive = true;
        await existingUser.save();
      }
      if (existingUser.verify === false) {
        existingUser.verify = true;
        await existingUser.save();
      }
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

const sendVerificationEmail = async (email) => {
  try {
    const connection = new DatabaseTransaction();

    const user = await connection.userRepository.findUserByEmail(email);
    if (!user) throw new Error("User not found");
    if (user.verify === true) throw new Error("User is already verified");

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
        <a href="http://localhost:4000/api/auth/verify?token=${token}">Click here to verify your email</a>
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
    throw new Error(`Error when sending verification email: ${error.message}`);
  }
};

const verifyEmail = async (token, res) => {
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const email = decodedToken.email;

    const connection = new DatabaseTransaction();
    const user = await connection.userRepository.findUserByEmail(email);
    if (!user || user.verifyToken !== token) {
      throw new Error("Invalid token");
    }
    if (user.verify === true) throw new Error("User is already verified");

    user.verify = true;
    user.verifyToken = null;
    await user.save();
    return user;
  } catch (error) {
    throw new Error(`Error when verifying email: ${error.message}`);
  }
};

const sendVerificationPhone = async (phoneNumber) => {
  try {
    const connection = new DatabaseTransaction();

    const user = await connection.userRepository.findUserByPhoneNumber(
      phoneNumber
    );
    if (!user) throw new Error("User not found");
    if (user.verify === true) throw new Error("User is already verified");

    const status = await sendVerificationCode(phoneNumber);
    if (status !== "pending") {
      throw new Error("Error when sending verification code");
    }

    return status;
  } catch (error) {
    throw new Error(`Error when sending verification phone: ${error.message}`);
  }
};

const verifyPhone = async (phoneNumber, code) => {
  try {
    const connection = new DatabaseTransaction();
    const user = await connection.userRepository.findUserByPhoneNumber(
      phoneNumber
    );
    if (!user) throw new Error("User not found");
    if (user.verify === true) throw new Error("User is already verified");

    const status = await checkVerification(phoneNumber, code);
    if (status !== "approved") {
      throw new Error("Phone number verification failed");
    }

    user.verify = true;
    await user.save();

    return status;
  } catch (error) {
    throw new Error(`Error when verifying phone: ${error.message}`);
  }
};

module.exports = {
  signUp,
  login,
  loginGoogle,
  loginApple,
  sendVerificationEmail,
  sendVerificationPhone,
  verifyPhone,
  verifyEmail,
};
