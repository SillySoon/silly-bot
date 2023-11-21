import { Client, ActivityType, Collection } from "discord.js";
import { config } from "./utils/config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import { MongoClient } from 'mongodb';
import * as logger from 'silly-logger';

// Logger configuration
logger.timeFormat("MMM Do YY - h:mm:ss a");
logger.enableLogFiles(true);
logger.logFolderPath('./logs');

// Start up a client
const client = new Client({
  intents: [
    "Guilds",
    "GuildMessages",
    "DirectMessages"
  ],
});

// Connecting to MongoDB
const dbClient = new MongoClient(String(config.MONGODB_URI));
(async function dbSetup() {
	await dbClient.connect();
	logger.custom('DATABASE', 'gold', '', 'Successfully connected to MongoDB');

  // Try if database exists
  try {
		const databases = (await dbClient.db().admin().listDatabases()).databases;
		let found = false;
		databases.forEach((database) => {
			if (database.name === "silly-database") found = true;
		});
		if (!found) {
			throw new Error("Database not existing!");
		}
	} catch (err) {
    logger.error(`Database not existing! Please create a mongodb database called 'silly-database' and restart the bot!`);
		process.exit(1);
	}

  // Lookup tables in DB
  const requiredCollections = ['servers'];
	const collections = await dbClient.db("silly-database").listCollections().toArray();
	const collectionsOnServer: string[] = [];
	const notFound: string[] = [];

	collections.forEach((collection) => {
		collectionsOnServer.push(collection.name);
	});

	requiredCollections.forEach((collection) => {
		if (!collectionsOnServer.includes(collection)) notFound.push(collection);
	});

	if (notFound.length > 0) {
		logger.error(`Missing collections: ${notFound.join(', ')}`);
    logger.custom('DATABASE', 'gold', '', `Creating missing collections...`);
		notFound.forEach(async (collection) => {
			dbClient.db("silly-database").createCollection(collection);
      logger.custom('DATABASE', 'gold', '', `Created collection ${collection}!`);
		});
	}
	logger.success("Database setup complete!\n");
} ());

// Console log when bot is ready
client.once("ready", () => {
  if (!client.user) return;
  logger.success(`Ready! Logged in as ${client.user.tag}`);

  // Deploy all commands
  deployCommands();

  // Interval to refresh activity
  setInterval(async () => {
    if (!client.user) return;
    client.user.setActivity(`/help`, { type: ActivityType.Watching });
  }, 15000);

  // Kickstart activity
  client.user.setActivity(`/help`, { type: ActivityType.Watching });
});

// Deploy commands when joining a server
client.on("guildCreate", async (guild) => {

});

// Run command when interaction is created
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  if (commands[commandName as keyof typeof commands]) {
    try {
      commands[commandName as keyof typeof commands].execute(interaction);
      logger.custom('INTERACTION', '#ffffff', '', `By ${interaction.member?.user.username} - /${interaction.commandName}`);
    } catch (error: any) {
      logger.error(error);
      try {
        await interaction.reply({ content: `There was an error while executing this command!\nJoin the Support Server and send us the error message:\n \`\`\`js\n ${JSON.stringify(interaction, null, 4)} \`\`\` \`\`\`js\n${error}\`\`\` \n (DISCORD INVITE) `, embeds: [], ephemeral: true });
      } catch (err: any) {
        logger.error(err);
        await interaction.reply({ content: `There was an error while executing this command, but there was another error sending the error message!\n Please contact us and include the following information: \`command name, options, time of execution\` \n (DISCORD INVITE) `, embeds: [], ephemeral: true });
      }
    }
  }
});

client.login(config.DISCORD_TOKEN);