const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const bcrypt = require("bcrypt");
const { validEmail, validPassword } = require("../utils/validator");

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
module.exports = { signUp, login, loginGoogle };
