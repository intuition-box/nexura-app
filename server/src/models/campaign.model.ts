import mongoose, { Schema } from "mongoose";

const campaignSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	project_image: {
		type: String,
		required: true,
	},
	project_name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	starts_at: {
		type: Date,
		required: true,
	},
	totalXpAvailable: {
		type: Number,
		required: true,
	},
	xpClaimed: {
		type: Number,
		default: 0,
	},
	totalTrustAvailable: {
		type: Number,
		required: true,
	},
	trustClaimed: {
		type: Number,
		default: 0,
	},
	ends_at: {
		type: Date,
		required: true,
	},
	participants: {
		type: Number,
		default: 0,
	},
	status: {
		type: String,
		default: "Active",
		enum: ["Active", "Scheduled", "Ended"],
	},
	contractAddress: {
		type: String,
	},
	reward: {
		xp: {
			type: Number,
			required: true,
		},
		trustTokens: {
			type: Number,
			required: true,
		},
		pool: {
			type: Number,
			required: true
		}
	},
	noOfQuests: {
		type: Number,
		default: 0,
	},
	projectCoverImage: {
		type: String,
		required: true,
	},
	creator: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "project",
	},
}, { timestamps: true });

export const campaign = mongoose.model("campaigns", campaignSchema);

const campaignCompletedSchema = new Schema({
	questsCompleted: {
		type: Boolean,
		default: false,
	},
	campaignCompleted: {
		type: Boolean,
		default: false,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user",
	},
	campaign: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "campaign",
	},
}, { timestamps: true });

export const campaignCompleted = mongoose.model(
	"completed-campaigns",
	campaignCompletedSchema
);
