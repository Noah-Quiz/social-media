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
    default: "",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  streamOnlineUrl: {
    type: String,
    default: "",
  },
  streamServerUrl: {
    type: String,
    default: "",
  },
  uid: {
    type: String,
    default: "",
  },
  rtmps: {
    url: { type: String, default: "" },
    streamKey: { type: String, default: "" },
  },
  rtmpsPlayback: {
    url: { type: String, default: "" },
    streamKey: { type: String, default: "" },
  },
  srt: {
    url: { type: String, default: "" },
    streamId: { type: String, default: "" },
    passphrase: { type: String, default: "" },
  },
  srtPlayback: {
    url: { type: String, default: "" },
    streamId: { type: String, default: "" },
    passphrase: { type: String, default: "" },
  },
  webRTC: {
    url: { type: String, default: "" },
  },
  webRTCPlayback: {
    url: { type: String, default: "" },
  },
  meta: {
    name: { type: String, default: "" },
  },
  status: {
    type: String,
    enum: ["live", "offline"],
    default: "offline",
  },
  thumbnailUrl: {
    type: String,
    default: "",
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
