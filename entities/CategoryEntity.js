const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: String,
  ...baseEntitySchema.obj, // Spread operator to include base entity fields
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
