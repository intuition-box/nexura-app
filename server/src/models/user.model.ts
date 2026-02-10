import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	address: {
		type: String,
		required: true,
		unique: true
	},
	profilePic: {
		type: String,
		default: "",
	},
	socialProfiles: {
		x: {
			connected: {
				type: Boolean,
				default: false
			},
			username: {
				type: String,
			},
			id: {
				type: String,
			},
			disconnectedAt: {
				type: Date,
			}
		},
		discord: {
			connected: {
				type: Boolean,
				default: false
			},
			username: {
				type: String,
			},
			id: {
				type: String,
			},
			disconnectedAt: {
				type: Date,
			}
		},
	},
	referralAllowed: {
		type: Boolean
	},
	email: {
		type: String,
		// required: true
	},
	level: {
		type: String,
		default: "1",
	},
	xp: {
		type: Number,
		default: 0,
	},
	badges: [{
		type: Number
	}],
	referral: {
		code: {
			type: String,
			required: true,
		},
		users: {
			type: Number,
			default: 0,
		},
		xp: {
			type: Number,
			default: 0,
		},
	},
	lastSignInDate: {
		type: String
	},
	streak: {
		type: Number,
		default: 0
	},
	longestStreak: {
		type: Number,
		default: 0
	},
	questsCompleted: {
		type: Number,
		default: 0,
	},
	campaignsCompleted: {
		type: Number,
		default: 0,
	},
	trustEarned: {
		type: Number,
		default: 0,
	},
	dateJoined: {
		type: String,
		required: true,
	},
	refRewardClaimed: {
		type: Boolean,
		default: false
	},
	status: {
		type: String,
		default: "Inactive"
	},
	campaigns: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "campaign",
	}],
}, { timestamps: true });

userSchema.index({ xp: -1 });

export const user = mongoose.model("users", userSchema);
