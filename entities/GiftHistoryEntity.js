const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity");

// Gift schema for each entry in the "gifts" array, with snapshot fields defaulting to an empty string
const giftSchema = new mongoose.Schema(
  {
    giftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gift",
      required: true,
    },
    quantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    name: { type: String, default: "" }, // Gift name for history with empty string default
    image: { type: String, default: "" }, // Gift image URL for history with empty string default
  },
  { _id: false } // Disable _id for each object in the "gifts" array
);

const giftHistorySchema = new mongoose.Schema({
  streamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stream",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  gifts: [giftSchema], // Use the giftSchema for the "gifts" array
  total: { type: Number, required: true },
  streamerTotal: { type: Number, required: true },
  streamTitle: { type: String, default: "" }, // Stream title with empty string default
  streamThumbnail: { type: String, default: "" }, // Stream thumbnail URL with empty string default
  ...baseEntitySchema.obj,
});

const GiftHistory = mongoose.model("GiftHistory", giftHistorySchema);

module.exports = GiftHistory;
