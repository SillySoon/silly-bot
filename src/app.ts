// Require the necessary discord.js classes
import { Client, ActivityType, Collection } from "discord.js";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import { config } from "./utils/config";
import { db } from "./utils/db";
import { version } from "../package.json";
import logger from "silly-logger";

// Setup logger
logger.timeFormat("MMM Do YY - h:mm:ss a");
logger.enableLogFiles(true);
logger.logFolderPath("./logs");

// Start up a client
export const client = new Client({
  intents: ["Guilds", "GuildMessages", "MessageContent"],
});

// Setup database
db.setup();

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  db.addPoints(message.author.id, message.guildId, 10);
});

// Run command when interaction is created
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  if (commands[commandName as keyof typeof commands]) {
    try {
      commands[commandName as keyof typeof commands].execute(interaction);
      logger.custom(
        "INTERACTION", 
        "#ffffff",
        "",
        `By ${interaction.member?.user.username} - /${interaction.commandName}`
      );
    } catch (error: any) {
      logger.error(error);
      try {
        await interaction.reply({
          content: `There was an error while executing this command!\nJoin the Support Server and send us the error message:\n \`\`\`js\n ${JSON.stringify(
            interaction,
            null,
            4
          )} \`\`\` \`\`\`js\n${error}\`\`\` \n (DISCORD INVITE) `,
          embeds: [],
          ephemeral: true,
        });
      } catch (err: any) {
        logger.error(err);
        await interaction.reply({
          content: `There was an error while executing this command, but there was another error sending the error message!\n Please contact us and include the following information: \`command name, options, time of execution\` \n (DISCORD INVITE) `,
          embeds: [],
          ephemeral: true,
        });
      }
    }
  }
});

// Console log when bot is ready
client.once("ready", () => {
  if (!client.user) return;
  logger.success(`Ready! Logged in as ${client.user.tag}`);

  // Deploy all commands
  deployCommands();

  // Interval to refresh activity
  setInterval(async () => {
    if (!client.user) return;
    client.user.setActivity(`v${version}`, { type: ActivityType.Watching });
  }, 15000);

  // Kickstart activity
  client.user.setActivity(`v${version}`, { type: ActivityType.Watching });
});

// check every 10 minutes if someone is in a voice chat and give them points
setInterval(() => {
  client.guilds.cache.forEach(async (guild) => {
    guild.members.cache.forEach(async (member) => {
      if (member.voice.channel) {
        db.addPoints(member.id, guild.id, 100);
        logger.custom("VOICE", "#ffffff", "", `Gave 100 points to ${member.user.username}`);
      }
    });
  });
}, 10 * 60 * 1000);

client.login(config.DISCORD_TOKEN);
