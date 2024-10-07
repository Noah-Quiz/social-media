import mongoose from 'mongoose';
import baseEntitySchema from './BaseEntity.js';

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    imageUrl: String,
    idDeleted: {type: String, default: false},
    status: String,
    
    ...baseEntitySchema.obj // Spread operator to include base entity fields
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
