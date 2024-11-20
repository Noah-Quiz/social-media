const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity");

const Schema = mongoose.Schema;

const roomSchema = new Schema(
  {
    name: {
      type: String,
      minlength: [1, "Room name must be at least 1 character long"],
      maxlength: [100, "Room name cannot exceed 100 characters"],
      required: function () {
        return this.enumMode !== "private";
      },
    },
    enumMode: {
      type: String,
      enum: ["private", "member", "public", "group"],
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    participants: {
      type: [
        {
          _id: false,
          userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
          },
          joinedDate: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },

    admins: {
      type: [
        {
          _id: false,
          userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
          },
          assignedDate: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    ...baseEntitySchema.obj,
  },
);

module.exports = mongoose.model("Room", roomSchema);