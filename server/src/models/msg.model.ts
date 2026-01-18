import mongoose from "mongoose";

const firstMessageSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  guild_id: {
    type: String,
    required: true,
  }
}, { timestamps: true });

export const firstMessage = mongoose.model("first-msgs", firstMessageSchema);
