import { Client } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import * as logger from 'silly-logger';

// Logger configuration
logger.timeFormat("MMM Do YY - h:mm:ss a");
logger.enableLogFiles(true);
logger.logFolderPath('./logs');

// Start up a client
const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

// Console log when bot is ready
client.once("ready", () => {
  logger.success("Discord bot is ready! 🤖");
});

// Deploy commands when joining a server
client.on("guildCreate", async (guild) => {
  await deployCommands({ guildId: guild.id });
});

// Run command when interaction is created
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  const { commandName } = interaction;
  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(interaction);
  }
});

client.login(config.DISCORD_TOKEN);