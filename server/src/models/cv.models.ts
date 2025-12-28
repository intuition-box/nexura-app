import mongoose from "mongoose";
import { truncate } from "node:fs";

const cvSchema = new mongoose.Schema({
  cv: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true });

export const cvModel = mongoose.model("cv", cvSchema);