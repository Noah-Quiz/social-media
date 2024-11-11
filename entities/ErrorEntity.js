const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity");

const errorSchema = mongoose.Schema({
  code: { type: String, required: true },
  message: { type: String, required: true },
  file: { type: String, required: true },
  function: { type: String, required: true },
  stackTrace: { type: String, required: true },
  ...baseEntitySchema.obj,
});

const Error = mongoose.model("Error", errorSchema);

module.exports = Error;
