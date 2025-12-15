import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true,
  },
  // email: {
  //   type: String,
  //   required: true
  // },
  // password: {
  //   type: String,
  //   required: true
  // },
  logo: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  campaignsCreated: {
    type: Number,
    default: 0
  },
  xpAllocated: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export const project = mongoose.model("projects", projectSchema);
