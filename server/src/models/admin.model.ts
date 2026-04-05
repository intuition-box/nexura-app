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
    required(this: { verified?: boolean }) {
      return Boolean(this.verified);
    }
  },
  verified: {
    type: Boolean,
    default: false
  },
  code: {
    type: String,
  },
  lastActivity: {
    type: Date,
    default: null
  },
  isOnline: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export const admin = mongoose.model("admin", adminSchema);
