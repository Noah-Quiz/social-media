const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validEmail, validPassword } = require("../utils/validator");
const mailer = require("../utils/mailer");
const signUp = async (fullName, email, password) => {
  try {
    const connection = new DatabaseTransaction();

    validEmail(email);
    validPassword(password);

    const existingUser = await connection.userRepository.findUserByEmail(email);
    if (existingUser) throw new Error("Email is already registered");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await connection.userRepository.createUser({
      fullName: fullName,
      email: email,
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
    }
    const newUser = await connection.userRepository.createUser({
      fullName: user.appleUser.name.firstName + " " + user.appleUser.name.lastName,
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

    user.verify = true;
    user.verifyToken = null;
    await user.save();
    return user;
  } catch (error) {
    throw new Error(`Error when verifying email: ${error.message}`);
  }
};
module.exports = {
  signUp,
  login,
  loginGoogle,
  loginApple,
  sendVerificationEmail,
  verifyEmail,
};
