const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity");

const advertisementPackageSchema = new mongoose.Schema({
  coin: {
    require: true,
    type: Number,
  },
  dateUnit: {
    type: String,
    require: true,
    enum: ["DAY", "MONTH", "YEAR"],
  },
  numberOfDateUnit: {
    type: Number,
    require: true,
  },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "ACTIVE",
  },
  ...baseEntitySchema.obj,
});

const AdvertisementPackage = mongoose.model(
  "AdvertisementPackage",
  advertisementPackageSchema
);

module.exports = AdvertisementPackage;
