const mongoose = require('mongoose');
const baseEntitySchema = require('./BaseEntity.js');

const myPlaylistSchema = new mongoose.Schema({
    playlistName: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    videoId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        unique: true,
    }],
    ...baseEntitySchema.obj
});

const MyPlaylist = mongoose.model('MyPlaylist', myPlaylistSchema);

module.exports = MyPlaylist;
