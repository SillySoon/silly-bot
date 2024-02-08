// Require the necessary discord.js classes
import { Client, ActivityType, Collection } from "discord.js";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import { config } from "./utils/config";
import { db } from "./database";
import { version } from "../package.json";
import logger from "silly-logger";

// Setup logger
logger.timeFormat("MMM Do YY - h:mm:ss a");
logger.enableLogFiles(true);
logger.logFolderPath("./logs");

// Log current bot version
logger.deploy(`Welcome! This is bot Version: v${version}`);

// Start up a client
export const client = new Client({
  intents: ["Guilds", "GuildMessages", "MessageContent", "GuildVoiceStates", "GuildMembers"],
});

// Setup database
db.setup();

// Add points to user when they send a message
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  db.guild.member.points.add(message.guildId, message.author.id, 10);
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

  const guild = await db.guild.get(message.guildId);
  // console.log(guild);
  if (!guild) return;

  // if counting is not enabled return
  // console.log(guild.modules[1].enable);
  if (!guild.modules[1].enable) return;

  // if channel is not the counting channel return
  // console.log(guild.modules[1].channel);
  if (message.channelId != guild.modules[1].channel) return;

  // get counting value and user
  const counting = await db.guild.modules.counting.get(message.guildId);
  let countingValue = counting.value;
  let countingUser = counting.user;

  // if user is the same as the counting user fail the message
  if (message.author.id == countingUser) {
    message.react("<:negative:1203089360644476938>");
    await message.reply(
      "You can't count twice in a row! The counting has been reset. Start from 1 again!"
    );
    db.guild.modules.counting.changeValue(message.guildId, 1);
    db.guild.modules.counting.changeUser(message.guildId, "");
    return;
  } else if (messageContent != countingValue.toString()) {
    message.react("<:negative:1203089360644476938>");
    await message.reply(
      "You broke the counting! The counting has been reset. Start from 1 again!"
    );
    db.guild.modules.counting.changeValue(message.guildId, 1);
    db.guild.modules.counting.changeUser(message.guildId, "");
  } else {
    message.react("<:positive:1203089362833768468>");
    db.guild.member.points.add(message.guildId, message.author.id, 5);
    db.guild.modules.counting.changeValue(message.guildId, countingValue + 1);
    db.guild.modules.counting.changeUser(message.guildId, message.author.id);
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

  try {
    // Fetch all guilds and members
    client.guilds.cache.forEach(async (guild) => {
      await db.guild.add(guild.id);

      guild.members.fetch().then((members) => {
        members.forEach(async (member) => {
          await db.guild.member.add(guild.id, member.id);
        });
      });
    });
  } catch (error: any) {
    logger.error(error);
  } finally {
    logger.deploy("All guilds and members fetched");
  }
});

// Event when member joins guild
client.on("guildMemberAdd", async (member) => {
  await db.guild.member.add(member.guild.id, member.id);
  logger.custom("GUILD", "#F2B75C", "", `Member joined ${member.user.username}`);
});

/* check every 10 minutes if someone is in a voice chat and give them points
setInterval(() => {
  client.guilds.cache.forEach(async (guild) => {
    guild.voiceStates.cache.forEach(voiceState => {
      const member = voiceState.member;
      if (member) {
        db.guild.member.points.add(guild.id, member.id, 30);
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
*/

// Event when client joins guild
client.on("guildCreate", (guild) => {
  db.guild.add(guild.id);
  guild.members.fetch().then((members) => {
    members.forEach(async (member) => {
      await db.guild.member.add(guild.id, member.id);
    });
  });
  logger.custom("GUILD", "#F2B75C", "", `Joined guild ${guild.name}`);
});

// Event when client leaves guild
client.on("guildDelete", (guild) => {
  db.guild.remove(guild.id);
  logger.custom("GUILD", "#F2B75C", "", `Left guild ${guild.name}`);
});

// Login to Discord
client.login(config.DISCORD_TOKEN);