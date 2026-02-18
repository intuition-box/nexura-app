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
    unique: true
  },
  xUsername: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
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

const projectAdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'projects',
    required: true
  }
}, { timestamps: true });

export const projectAdmin = mongoose.model("project-admins", projectAdminSchema);
