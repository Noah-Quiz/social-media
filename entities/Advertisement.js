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
  advertisementPackages: [
    {
      type: mongoose.Types.ObjectId,
      ref: "AdvertisementPackage",
      require: true,
    },
  ],
  currentPackageIndex: {
    type: Number,
    default: 0,
  },
  totalCoin: {
    type: Number,
  },
  rank: {
    type: Number,
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
