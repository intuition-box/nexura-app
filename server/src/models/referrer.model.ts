import mongoose, { Schema } from "mongoose";

const referredUsersSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  status: {
    type: String,
    default: "Inactive",
    enum: ["Inactive", "Active"]
  },
  signedUp: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
}, {timestamps: true});

export const referredUsers = mongoose.model("referred-users", referredUsersSchema);
