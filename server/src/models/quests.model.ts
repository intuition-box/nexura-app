import mongoose, { Schema } from "mongoose";

const ecosystemQuestSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	logo: {
		type: String,
		required: true,
	},
	reward: {
		type: Number,
		required: true
	},
	websiteUrl: {
		type: String,
		required: true,
	},
	category: {
		type: String,
		required: true,
		enum: [
			"defi",
			"lending protocols",
			"prediction markets",
			"nft",
			"infrastructure",
			"identity",
			"reputation",
			"quests",
			"ai",
			"social",
			"gaming",
			"tools",
			"portal",
			"domain name",
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
		required: true
	},
	sub_title: {
		type: String
	},
	noOfQuests: {
		type: Number,
		default: 0
	},	
	description: {
		type: String,
	},
	questNumber: {
		type: Number
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
		expires: "14d",
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
