const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity.js");

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  videoUrl: { type: String, default: "" },
  videoEmbedUrl: { type: String, default: "" },
  videoServerUrl: { type: String, default: "" },
  numOfViews: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  enumMode: {
    type: String,
    enum: ["public", "private", "unlisted", "member", "draft"],
    default: "public",
  },
  thumbnailUrl: { type: String, default: "" },
  categoryIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ...baseEntitySchema.obj,
});

// Kiểm tra nếu mô hình đã tồn tại trước đó
const Video = mongoose.models.Video || mongoose.model("Video", videoSchema);

module.exports = Video;
