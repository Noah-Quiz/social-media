const mongoose = require("mongoose");
const { default: baseEntitySchema } = require("./baseEntity");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    default: "",
    trim: true,
    minlength: [3, "Name must be at least 1 characters long"],
    maxlength: [50, "Name cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    default: "",
    maxlength: [250, "Bio cannot exceed 250 characters"],
  },
  avatarUrl: {
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
});
const User = mongoose.model("User", userSchema);
module.exports = User;
