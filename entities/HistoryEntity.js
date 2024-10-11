// models/WatchHistory.js

const mongoose = require('mongoose');
const baseEntitySchema = require('./BaseEntity');
const Schema = mongoose.Schema;

const watchHistorySchema = new Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  videoId: {
    type: mongoose.Types.ObjectId,
    ref: 'Video',
    required: true,
  },
  ...baseEntitySchema.obj
});

const WatchHistory = mongoose.model('WatchHistory', watchHistorySchema);

module.exports = WatchHistory;
