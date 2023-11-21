import { REST, Routes } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import * as logger from 'silly-logger';

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

export async function deployCommands() {
  try {
    logger.info("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationCommands(config.DISCORD_APPLICATION_ID),
      {
        body: commandsData,
      }
    );

    logger.info("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}