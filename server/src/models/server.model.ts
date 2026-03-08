import mongoose from "mongoose";

const serverSchema = new mongoose.Schema({
  servers: [{
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    }
  }]
}, { timestamps: true });

export const server = mongoose.model("servers", serverSchema);
