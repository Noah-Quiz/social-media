const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  content: {
    type: String,
    required: [true, "Message content is required"],
    minlength: [1, "Message must be at least 1 character long"],
    maxlength: [500, "Message cannot exceed 500 characters"],
    default: "",
  },
  roomId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ...baseEntitySchema.obj,
});

module.exports = mongoose.model("Message", messageSchema);
