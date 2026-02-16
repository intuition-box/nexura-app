import { Schema, model } from 'mongoose';

const OTPSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  projectId: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    default: new Date(),
    expires: 300 // OTP expires in 5 minutes
  }
});

export const OTP = model('OTPs', OTPSchema);