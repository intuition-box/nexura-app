import mongoose, { Schema } from "mongoose";

const ecosystemQuestSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		timer: {
			type: Number,
			required: true,
		},
		logo: {
			type: String,
			required: true,
		},
		rewards: {
			xp: {
				type: Number,
				default: 0,
			},
			trust: {
				type: Number,
				default: 0,
			},
		},
		link: {
			type: String,
			required: true,
		},
		tags: {
			type: String,
			required: true,
			enum: [
				"defi",
				"lending-protocols",
				"prediction-markets",
				"nft",
				"social",
				"gaming",
				"portal",
				"domain-name",
				"launchpads",
			],
		},
	},
	{ timestamps: true }
);

export const ecosystemQuest = mongoose.model(
	"ecosystem-quests",
	ecosystemQuestSchema
);

const campaignQuestSchema = new Schema(
	{
		quest: {
			type: String,
			required: true,
		},
		xp: {
			type: Number,
			required: true,
		},
		category: {
			type: String,
			enum: ["twitter", "discord", "reddit", "instagram", "facebook", "other"],
			required: true,
		},
		link: {
			type: String,
		},
		campaign: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "campaign",
		},
	},
	{ timestamps: true }
);

export const campaignQuest = mongoose.model(
	"campaign-quest",
	campaignQuestSchema
);

const questSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		reward: {
			xp: {
				type: Number,
				required: true,
			},
			trust: {
				type: Number,
				// required: true
			},
		},
		url: {
			type: String,
			required: false,
		},
		category: {
			type: String,
			enum: ["one-time", "weekly"],
		},
		expires: {
			type: Date,
			expires: "7d",
			required: false,
		},
	},
	{ timestamps: true }
);

export const quest = mongoose.model("quests", questSchema);
