import mongoose from "mongoose";

const adminschema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  verified: {
    type: Boolean,
    default: false
  },
  code: {
    type: String,
  }
}, { timestamps: true });

export const admin = mongoose.model("admin", adminschema);
