const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity.js");
const ExchangeRate = require("./ExchangeRateEntity.js");

const receiptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  paymentMethod: {
    type: String,
    enum: ["ATM", "VISA", "MASTERCARD", "JCB"],
    required: true,
  },
  paymentPort: { type: String, required: true },
  bankCode: { type: String, required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String, required: true, unique: true },
  type: {
    type: String,
  },
  exchangeRate: {
    type: Number,
    required: true,
  },
  ...baseEntitySchema.obj,
});

const Receipt = mongoose.model("Receipt", receiptSchema);

module.exports = Receipt;
