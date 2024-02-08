import { MongoClient } from "mongodb";
import { config } from "../utils/config";
import logger from "silly-logger";

// Connecting to MongoDB
export const dbClient = new MongoClient(String(config.MONGODB_URI));
export let dbName: string;

export async function setup() {
  await dbClient.connect();
  logger.custom("DATABASE", "gold", "", "Successfully connected to MongoDB");

  if (!config.MONGODB_DB_NAME) {
    config.MONGODB_DB_NAME = "silly-database";
    logger.warn(
      `MONGODB_DB_NAME not found in .env, using default value: ${config.MONGODB_DB_NAME}`
    );
  }

  // Try if database exists
  try {
    const databases = (await dbClient.db().admin().listDatabases()).databases;
    let found = false;
    databases.forEach((database) => {
      if (database.name === config.MONGODB_DB_NAME) {
        found = true;
        dbName = database.name;
      }
    });
    if (!found) {
      throw new Error("Database not existing!");
    }
  } catch (err) {
    logger.error(
      `Database not existing! Please create a mongodb database called 'silly-database' and restart the bot!`
    );
    process.exit(1);
  }

  logger.custom("DATABASE", "gold", "", `Connected to database ${dbName}`);

  // Lookup tables in DB
  const requiredCollections = ["user", "guild"];
  const collections = await dbClient.db(dbName).listCollections().toArray();
  const collectionsOnServer: string[] = [];
  const notFound: string[] = [];

  collections.forEach((collection) => {
    collectionsOnServer.push(collection.name);
  });

  requiredCollections.forEach((collection) => {
    if (!collectionsOnServer.includes(collection)) notFound.push(collection);
  });

  if (notFound.length > 0) {
    logger.error(`Missing collections: ${notFound.join(", ")}`);
    logger.custom("DATABASE", "gold", "", `Creating missing collections...`);
    notFound.forEach(async (collection) => {
      dbClient.db(dbName).createCollection(collection);
      logger.custom(
        "DATABASE",
        "gold",
        "",
        `Created collection ${collection}!`
      );
    });
  }
  logger.success("Database setup complete!\n");
}