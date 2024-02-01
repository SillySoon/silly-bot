// Require the necessary discord.js classes
import { Client, ActivityType, Collection } from "discord.js";
import { config } from "./utils/config";
import logger from "silly-logger";

// Start up a client
const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

// Console log when bot is ready
client.once("ready", () => {
  if (!client.user) return;
  logger.success(`Ready! Logged in as ${client.user.tag}`);
});

client.login(config.DISCORD_TOKEN);
