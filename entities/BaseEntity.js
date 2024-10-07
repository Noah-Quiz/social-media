const mongoose = require("mongoose");

const baseEntitySchema = new mongoose.Schema(
  {
    dateCreated: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  { _id: false, timestamps: false }
);

module.exports = baseEntitySchema;
