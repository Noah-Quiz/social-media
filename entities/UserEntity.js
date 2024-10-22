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
  appleUser: {
    type: Boolean,
    default: false,
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
  notifications: {
    type: [
      {
        avatar: String,
        content: String,
        check: String,
        checkCmt: String,
        seen: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
  follow: [
    {
      _id: false,
      followId: { type: mongoose.Types.ObjectId, ref: "User", require: true },
      followDate: { type: Date, default: Date.now, require: true },
    },
  ],
  followBy: [
    {
      _id: false,
      followById: { type: mongoose.Types.ObjectId, ref: "User", require: true },
      followByDate: { type: Date, default: Date.now, require: true },
    },
  ],
  wallet: {
    balance: {
      type: Number,
      default: 0,
    },
    coin: {
      type: Number,
      default: 0,
    },
  },
  totalWatchTime: {
    type: Number,
    default: 0,
  },
  point: {
    type: Number,
    default: 0,
  },
  suspense: {
    isSuspended: {
      type: Boolean,
      default: false,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
    },
    time: {
      type: Number,
      default: 0,
    },
  },
  ...baseEntitySchema.obj,
});

const User = mongoose.model("User", userEntitySchema);

module.exports = User;
