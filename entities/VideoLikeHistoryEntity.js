const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity");

const videoLikeHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

const VideoLikeHistory = mongoose.model(
  "VideoLikeHistory",
  videoLikeHistorySchema
);
module.exports = VideoLikeHistory;
