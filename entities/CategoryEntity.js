const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, default: ""},
  ...baseEntitySchema.obj,
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
