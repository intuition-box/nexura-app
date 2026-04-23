import mongoose, { Schema } from "mongoose";

const hubSchema = new Schema({
  systemKey: {
    type: String,
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  discordConnected: {
    type: Boolean,
    default: false
  },
  guildId: {
    type: String,
    unique: true,
    sparse: true,
  },
  verifiedId: {
    type: String,
    unique: true,
    sparse: true,
  },
  logo: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false,
    default: ""
  },
  website: {
    type: String,
    required: false,
    default: ""
  },
  xAccount: {
    type: String,
    required: false,
    default: ""
  },
  discordServer: {
    type: String,
    required: false,
    default: ""
  },
  discordSessionId: {
    type: String,
    required: false,
    default: ""
  },
  campaignsCreated: {
    type: Number,
    default: 0
  },
  noOfPayments: {
    type: Number,
    default: 0
  },
  xpAllocated: {
    type: Number,
    default: 200
  },
  superAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admins",
    required: true
  },
  pendingTxHash: {
    type: String,
    default: null,
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
  },
  pendingTxHash: {
    type: String,
    default: null,
  }
}, { timestamps: true });

export const hubAdmin = mongoose.model("hub-admins", hubAdminSchema);
