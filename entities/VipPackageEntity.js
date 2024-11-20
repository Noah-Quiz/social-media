const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity");

const vipPackageSchema = new mongoose.Schema({
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
    enum: ["DAY", "MONTH", "YEAR"], // Restricting values with enum
  },
  durationNumber: {
    type: Number,
    required: true,
  },
  ...baseEntitySchema.obj,
});

const vipPackage = mongoose.model("VipPackage", vipPackageSchema);

module.exports = vipPackage;
