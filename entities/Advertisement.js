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
  coin: {
    type: Number,
    require: true,
  },
  isAdvertised: {
    type: Boolean,
    default: true,
  },
  expDate: {
    type: Date,
  },
  ...baseEntitySchema.obj,
});

const Advertisement = mongoose.model("Advertisement", advertisementSchema);
module.exports = Advertisement;
