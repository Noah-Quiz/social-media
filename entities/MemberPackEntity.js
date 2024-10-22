const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity");

const memberPackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    required: true,
  },
  durationUnit: {
    type: String,
    required: true,
    enum: ["DAY", "MONTH", "YEAR"], // Adding enum to restrict values
  },
  durationNumber: {
    type: Number,
    required: true,
  },
  ...baseEntitySchema.obj,
});

const memberPack = mongoose.model("Pack", memberPackSchema);

module.exports = memberPack;
