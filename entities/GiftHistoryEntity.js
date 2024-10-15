const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity");

const giftSchema = new mongoose.Schema(
  {
    giftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gift",
      required: true,
    },
    quantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
  },
  { _id: false }
); // Disable _id for each object in the "gifts" array

const giftHistorySchema = new mongoose.Schema({
  streamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stream",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  gifts: [giftSchema], // Use the giftSchema for the "gifts" array
  total: { type: Number, required: true },
  ...baseEntitySchema.obj,
});

const GiftHistory = mongoose.model("GiftHistory", giftHistorySchema);

module.exports = GiftHistory;
