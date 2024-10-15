const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity");

const giftSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  valuePerUnit: { type: Number, required: true },
  ...baseEntitySchema.obj,
});

const Gift = mongoose.model("Gift", giftSchema);

module.exports = Gift;
