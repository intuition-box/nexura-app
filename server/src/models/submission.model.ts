import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  submissionLink: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }
}, { timestamps: true });

export const submission = mongoose.model("submissions", submissionSchema);


