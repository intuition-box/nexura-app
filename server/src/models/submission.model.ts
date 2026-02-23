import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  submissionLink: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "retry", "done", "banned"],
    default: "pending"
  },
  page: {
    type: String,
    required: true
  },
  address: {
    type: String,
  },
  taskType: {
    type: String,
    required: true,
  },
  validatedBy: {
    type: String,
  },
  username: {
    type: String,
    required: true
  },
  miniQuestId: {
    type: String,
    required: true
  },
  questCompleted: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }
}, { timestamps: true });

export const submission = mongoose.model("submissions", submissionSchema);
