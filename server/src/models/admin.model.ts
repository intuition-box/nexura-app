import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String
  },
  role: {
    type: String,
    default: "admin",
    enum: ["superadmin", "admin"]
  },
  password: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  code: {
    type: String,
  }
}, { timestamps: true });

export const admin = mongoose.model("admin", adminSchema);
