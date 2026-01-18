import { firstMessage } from "@/models/msg.model";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { BOT_TOKEN } from "@/utils/env.utils";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user?.tag}`);
})

client.on(Events.MessageCreate, async (message) => {
  console.log({ content: message.content, author: message.author.tag });
  return;
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

client.login(BOT_TOKEN);
