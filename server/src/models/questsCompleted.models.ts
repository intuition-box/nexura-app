import mongoose, { Schema } from "mongoose";

const questCompletedSchema = new Schema({
	done: {
		type: Boolean,
		required: true,
	},
	category: {
		type: String,
		required: true,
		enum: ["weekly", "one-time"],
	},
	quest: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "quests",
	},
	expiresAt: {
		type: Date,
		expires: "7d",
		required: false,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user",
	},
}, { timestamps: true });

export const questCompleted = mongoose.model(
	"quest-completed",
	questCompletedSchema
);

const miniQuestCompletedSchema = new Schema({
	done: {
		type: Boolean,
		required: true,
	},
	miniQuest: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "mini-quest",
	},
	quest: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "quests",
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user",
	},
}, { timestamps: true });

export const miniQuestCompleted = mongoose.model(
	"mini-quest-completed",
	miniQuestCompletedSchema
);

const campaignQuestCompletedSchema = new Schema({
	done: {
		type: Boolean,
		required: true,
	},
	campaign: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "campaign"
	},
	campaignQuest: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "campaignQuest",
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user",
	},
}, { timestamps: true });

export const campaignQuestCompleted = mongoose.model(
	"campaignQuest-completed",
	campaignQuestCompletedSchema
);

const ecosystemQuestCompletedSchema = new Schema({
	done: {
		type: Boolean,
		required: true,
	},
	timer: {
		type: Date,
		required: true,
	},
	ecosystemQuest: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "ecosystemQuest",
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user",
	},
}, { timestamps: true });

export const ecosystemQuestCompleted = mongoose.model(
	"ecosystemQuest-completed",
	ecosystemQuestCompletedSchema
);
