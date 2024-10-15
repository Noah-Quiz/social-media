const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity");

const Schema = mongoose.Schema;

const streamSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  streamKey: {
    type: String,
    default: '',
  },
  streamUrl: {
    type: String,
    default: '',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: '',
  },
  categoryIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
  likedBy: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  endedAt: {
    type: Date,
  },
  ...baseEntitySchema.obj,
});

const Stream = mongoose.model("Stream", streamSchema);

module.exports = Stream;