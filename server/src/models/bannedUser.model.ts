import mongoose from "mongoose";

const bannedUserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true
  }
});

export const bannedUser = mongoose.model("banned-users", bannedUserSchema);