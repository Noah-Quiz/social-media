const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity.js");

const myPlaylistSchema = new mongoose.Schema({
  playlistName: { type: String, required: true },
  description: { type: String, required: false },
  thumbnail: { type: String, required: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videoIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  ...baseEntitySchema.obj,
});

const MyPlaylist = mongoose.model("MyPlaylist", myPlaylistSchema);

module.exports = MyPlaylist;
