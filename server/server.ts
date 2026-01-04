import express from "express";
import cors from "cors";
import { Client, Events, GatewayIntentBits } from "discord.js";
import helmet from "helmet";
import { port, BOT_TOKEN } from "@/utils/env.utils";
import DB from "@/config/db";
import logger from "@/config/logger";
import appRoutes from "@/routes";
import { firstMessage } from "@/models/msg.model";

const server = express();

server.use(cors({ origin: ["http://localhost:5173", "https://nexura-app.vercel.app"] }));
server.use(helmet());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use("/api", appRoutes);

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	]
});

client.once(Events.ClientReady, (readyClient) => {
	logger.info(`Logged in as ${readyClient.user?.tag}`);
});

client.on(Events.MessageCreate, async (message) => {

	if (message.author.bot) return;
	if (!message.guild) return;

	const user_id = message.author.id;
	const guild_id = message.guild.id;
	
	const alreadySentMessage = await firstMessage.findOne({ user_id });

	if (!alreadySentMessage) {
		await firstMessage.create({
			user_id,
			guild_id
		});
	}
});

server.listen(port, async () => {
	await DB();
	await client.login(BOT_TOKEN);
	logger.info(`Server is running on port ${port}`);
});