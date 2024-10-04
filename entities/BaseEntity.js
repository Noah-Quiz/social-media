import mongoose from "mongoose";

const baseEntitySchema = new mongoose.Schema(
  {
    dateCreated: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
    status: { type: String, default: "active" },
  },
  { _id: false, timestamps: true }
);

export default baseEntitySchema;
