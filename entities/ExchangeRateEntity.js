const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity.js");

const ExchangeRateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: [
      "topUpBalanceRate",
      "topUpCoinRate",
      "exchangeRateBalanceToCoin",
      "exchangeRateCoinToBalance",
      "coinPer1000View",
      "pointToCoin",
    ],
  },
  value: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  ...baseEntitySchema.obj,
});

const ExchangeRate = mongoose.model("ExchangeRate", ExchangeRateSchema);
module.exports = ExchangeRate;
