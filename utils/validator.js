const validator = require("validator");
const validEmail = (email) => {
  if (!email) throw new Error("Email is required");
  if (!validator.isEmail(email)) throw new Error("Email is invalid");
};

const validPassword = (password) => {
  if (!password) throw new Error("Password is required");
  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  )
    throw new Error(
      "Password is invalid. It must be at least 8 characters, 1 lowercase, 1 uppercase, 1 number, and 1 symbol"
    );
};
module.exports = { validEmail, validPassword };
