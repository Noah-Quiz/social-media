// BaseEntity.js
const mongoose = require("mongoose");

const baseEntitySchema = new mongoose.Schema(
  {
    dateCreate: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
    isDelete: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
  },
  { _id: false, timestamps: true }
);

module.exports = baseEntitySchema;
