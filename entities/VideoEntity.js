const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity.js");

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  bunnyId: { type: String, default: "" },
  videoUrl: { type: String, required: true },
  numOfViews: { type: Number, default: 0 },
  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  enumMode: {
    type: String,
    enum: ["public", "private", "unlisted"],
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
