const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity");

const advertisementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    require: true,
  },
  videoId: {
    type: mongoose.Types.ObjectId,
    ref: "Video",
    require: true,
  },
  advertisementPackage: {
    type: mongoose.Types.ObjectId,
    ref: "AdvertisementPackage",
    require: true,
  },
  isAdvertised: {
    type: Boolean,
    default: true,
  },
  expDate: {
    type: Date,
    require: true,
  },
  ...baseEntitySchema.obj,
});

const Advertisement = mongoose.model("Advertisement", advertisementSchema);
module.exports = Advertisement;
