const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity.js");

const commentSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Types.ObjectId,
    ref: "Video",
    required: true,
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  likeBy: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  responseTo: {
    type: mongoose.Types.ObjectId,
    ref: "Comment",
  },
  ...baseEntitySchema.obj,
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
