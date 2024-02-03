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

// Add points to user when they send a message
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  db.addPoints(message.author.id, message.guildId, 10);
});

// Math regex
function calcSymboles(str: string) {
  const mathSymbolsRegex = /^[0-9+\-*/]+$/;
  return mathSymbolsRegex.test(str);
}

// Calculation of math
function calcMath(str: string) {
  if (!calcSymboles(str)) {
    return "Invalid math expression";
  }
  try {
    const result = new Function(`return ${str}`)();
    return result;
  } catch (error) {
    return "Error occurred while evaluating the expression";
  }
}

// Add counting on specific channel for specific guild
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // if message is not a number return
  if (isNaN(parseInt(message.content))) return;
  const messageContent = calcMath(message.content);
  // console.log(messageContent);

  const guild = await db.getGuild(message.guildId);
  if (
    guild == null ||
    !guild.counting.active ||
    guild.counting.channel != message.channelId ||
    isNaN(messageContent)
  )
    return;

  const countingValue = guild.counting.value;
  // if user is the same as the counting user fail the message
  if (message.author.id == guild.counting.user) {
    message.react("<:negative:1203089360644476938>");
    await message.reply(
      "You can't count twice in a row! The counting has been reset. Start from 1 again!"
    );
    db.setCountingValue(message.guildId, 1);
    db.setCountingUser(message.guildId, "");
    return;
  } else if (messageContent != countingValue.toString()) {
    message.react("<:negative:1203089360644476938>");
    await message.reply(
      "You broke the counting! The counting has been reset. Start from 1 again!"
    );
    db.setCountingValue(message.guildId, 1);
    db.setCountingUser(message.guildId, "");
  } else {
    message.react("<:positive:1203089362833768468>");
    db.addPoints(message.author.id, message.guildId, 5);
    db.setCountingValue(message.guildId, countingValue + 1);
    db.setCountingUser(message.guildId, message.author.id);
  }
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
        db.addPoints(member.id, guild.id, 30);
        logger.custom(
          "VOICE",
          "#7EF0E0",
          "",
          `Gave 30 points to ${member.user.username}`
        );
      }
    });
  });
}, 10 * 60 * 1000);

// Event when client joins guild
client.on("guildCreate", (guild) => {
  db.addGuild(guild.id);
  logger.custom("GUILD", "#F2B75C", "", `Joined guild ${guild.name}`);
});

// Event when client leaves guild
client.on("guildDelete", (guild) => {
  db.deleteGuild(guild.id);
  logger.custom("GUILD", "#F2B75C", "", `Left guild ${guild.name}`);
});

// Login to Discord
client.login(config.DISCORD_TOKEN);
