import mongoose, { Schema } from "mongoose";

const ecosystemQuestSchema = new Schema({
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
}, { timestamps: true });

export const ecosystemQuest = mongoose.model(
	"ecosystem-quests",
	ecosystemQuestSchema
);

const campaignQuestSchema = new Schema({
	quest: {
		type: String,
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
}, { timestamps: true });

export const campaignQuest = mongoose.model(
	"campaign-quest",
	campaignQuestSchema
);

const questSchema = new Schema({
	title: {
		type: String,
		// required: true
	},
	description: {
		type: String,
	},
	reward: {
		type: Number,
		required: true,
	},
	link: {
		type: String,
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
}, { timestamps: true });

export const quest = mongoose.model("quests", questSchema);

const miniQuestSchema = new Schema({
	text: {
		type: String,
		required: true,
	},
	link: {
		type: String
	},
	quest: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "quest",
	}
}, { timestamps: true });

export const miniQuest = mongoose.model("mini-quests", miniQuestSchema);
