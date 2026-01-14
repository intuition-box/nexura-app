import mongoose from "mongoose";

const timerSchema = new mongoose.Schema({
  time: {
    type: Date,
    required: true
  }
}, { timestamps: true });

export const timer = mongoose.model("timer", timerSchema);