const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity.js");

const ExchangeRateSchema = new mongoose.Schema({
  topUpBalanceRate: {
    type: Number,
    default: 1,
  },
  topUpCoinRate: {
    type: Number,
    default: 1000,
  },
  exchangeRateBalanceToCoin: {
    type: Number,
    default: 1000, //1 balance = 1000 coin
  },
  exchangeRateCoinToBalance: {
    type: Number,
    default: 0.0008, //1250coin = 1 balance =>service fee 250 coin
  },
  coinPer1000View: {
    type: Number,
    default: 100000,
  },
  ...baseEntitySchema.obj,
});
const ExchangeRate = mongoose.model("ExchangeRate", ExchangeRateSchema);
module.exports = ExchangeRate;
