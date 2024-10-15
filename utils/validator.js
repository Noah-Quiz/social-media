const validator = require("validator");
const CoreException = require("../exceptions/CoreException");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const mongoose = require("mongoose");

const validMongooseObjectId = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new CoreException(StatusCodeEnums.BadRequest_400, "Invalid id");
};
const validFullName = async (fullName) => {
  if (!fullName)
    throw new CoreException(
      StatusCodeEnums.BadRequest_400,
      "Full name is required"
    );
  if (!validator.isLength(fullName, { min: 6, max: 50 }))
    throw new CoreException(
      StatusCodeEnums.BadRequest_400,
      "Full name is invalid, must be a minimum of 6 characters and a maximum of 50 characters."
    );
};

const validEmail = async (email) => {
  if (!email)
    throw new CoreException(
      StatusCodeEnums.BadRequest_400,
      "Email is required"
    );
  if (!validator.isEmail(email))
    throw new CoreException(StatusCodeEnums.BadRequest_400, "Email is invalid");
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
    throw new CoreException(
      StatusCodeEnums.BadRequest_400,
      "Password is invalid. It must be at least 8 characters, 1 lowercase, 1 uppercase, 1 number, and 1 symbol"
    );
};

const validPhoneNumber = async (phoneNumber) => {
  if (!phoneNumber)
    throw new CoreException(
      StatusCodeEnums.BadRequest_400,
      "Phone number is required"
    );
  if (!validator.isMobilePhone(phoneNumber, "vi-VN"))
    throw new CoreException(
      StatusCodeEnums.BadRequest_400,
      "Phone number is invalid"
    );
};
module.exports = {
  validMongooseObjectId,
  validFullName,
  validEmail,
  validPassword,
  validPhoneNumber,
};
