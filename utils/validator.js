const validator = require("validator");

const validFullName = async (fullName) => {
  if (!fullName) throw new Error("Full name is required");
  if (!validator.isLength(fullName, { min: 6, max: 50 }))
    throw new Error("Full name must be between 6 and 50 characters");
};

const validEmail = async (email) => {
  if (!email) throw new Error("Email is required");
  if (!validator.isEmail(email)) throw new Error("Email is invalid");
};

const validPassword = async (password) => {
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

const validPhoneNumber = async (phoneNumber) => {
  if (!phoneNumber) throw new Error("Phone number is required");
  if (!validator.isMobilePhone(phoneNumber, "vi-VN"))
    throw new Error("Phone number is invalid");
};
module.exports = { validFullName, validEmail, validPassword, validPhoneNumber };
