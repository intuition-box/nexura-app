import mongoose, { Schema } from "mongoose";

const hubSchema = new Schema({
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
  discordConnected: {
    type: Boolean,
    default: false
  },
  xUsername: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  guildId: {
    type: String,
    unique: true,
    required: true
  },
  verifiedId: {
    type: String,
    unique: true,
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
  },
  superAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admins",
    required: true
  }
}, { timestamps: true });

export const hub = mongoose.model("hubs", hubSchema, "projects");

const hubAdminSchema = new mongoose.Schema({
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
  role: {
    type: String,
    enum: ["superadmin", "admin"],
    required: true
  },
  hub: {
    type: Schema.Types.ObjectId,
    ref: 'hubs',
  }
}, { timestamps: true });

export const hubAdmin = mongoose.model("hub-admins", hubAdminSchema);
