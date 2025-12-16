import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
		username: {
			type: String,
			// required: true
		},
		// password: {
		//   type: String,
		//   required: true
		// },
		email: {
			type: String,
			// required: true
		},
		level: {
			type: String,
			default: "1",
		},
		tier: {
			name: {
				type: String,
				default: "Trail Initiate",
			},
			level: {
				type: Number,
				default: 1,
			},
		},
		xp: {
			type: Number,
			default: 0,
		},
		badges: [{
			type: String
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
		campaigns: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "campaign",
			},
		],
	},
	{ timestamps: true }
);

export const user = mongoose.model("users", userSchema);
