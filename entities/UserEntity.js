const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity.js");
const { type } = require("express/lib/response.js");

const userEntitySchema = new mongoose.Schema({
  fullName: {
    type: String,
    require: [true, "Full name is required"],
    default: "",
    trim: true,
    minLength: [5, "Full name must be at least 6 characters"],
    maxLength: [50, "Full name must be at most 50 characters"],
  },
  nickName: {
    type: String,
    default: "",
    trim: true,
  },
  role: {
    type: Number,
    default: 0,
  },
  avatar: {
    type: String,
    default: "",
  },
  googleId: {
    type: String,
    default: "",
    unique: true,
  },
  email: {
    type: String,
    default: "",
    unique: true,
  },
  phoneNumber: {
    type: String,
    default: "",
    unique: true,
  },
  password: {
    type: String,
    require: [true, "Password is required"],
  },
  ipAddress: {
    type: String,
    default: "",
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  verify: {
    type: Boolean,
    required: true,
    default: false,
  },
  verifyToken: {
    type: String,
    default: "",
  },
  passwordResetToken: {
    type: String,
    default: "",
  },
  follow: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  followBy: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  ...baseEntitySchema.obj,
});

const User = mongoose.model("User", userEntitySchema);

module.exports = User;
