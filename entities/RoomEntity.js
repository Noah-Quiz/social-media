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
        return this.type !== "private"; // Room name is required except for private rooms
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
    participants: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
        validate: {
          validator: function (value) {
            if (this.type === "private" && (!value || value.length !== 2)) {
              return false; // Private rooms must have exactly 2 participants
            }
            return true;
          },
          message: "Private rooms must have exactly 2 participants",
        },
      },
    ],
    ...baseEntitySchema.obj,
  },
);

// Add an index to optimize participant queries
roomSchema.index({ participants: 1 });

module.exports = mongoose.model("Room", roomSchema);