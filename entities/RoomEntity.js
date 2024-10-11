const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity");

const Schema = mongoose.Schema;

const roomSchema = new Schema({
  name: {
    type: String,
    minlength: [1, "Room name must be at least 1 character long"],
    maxlength: [100, "Room name cannot exceed 100 characters"],
  },
  videoId: {
    type: mongoose.Types.ObjectId,
    ref: "Video",
    required: function () {
      return this.type === "video";
    }, // Only required if the room type is video-based
  },
  type: {
    type: String,
    enum: ["private", "video", "public", "group"],
    required: true,
  },
  participants: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.type === "private";
      }, // Only required if the room type is private (DM)
    },
  ],

  ...baseEntitySchema.obj,
}); // Automatically adds createdAt and updatedAt timestamps

module.exports = mongoose.model("Room", roomSchema);
