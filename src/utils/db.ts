import { MongoClient } from "mongodb";
import { config } from "./config";
import logger from "silly-logger";

// Connecting to MongoDB
const dbClient = new MongoClient(String(config.MONGODB_URI));

async function setup() {
  await dbClient.connect();
  logger.custom("DATABASE", "gold", "", "Successfully connected to MongoDB");

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
    logger.error(
      `Database not existing! Please create a mongodb database called 'silly-database' and restart the bot!`
    );
    process.exit(1);
  }

  // Lookup tables in DB
  const requiredCollections = ["user"];
  const collections = await dbClient
    .db("silly-database")
    .listCollections()
    .toArray();
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
      dbClient.db("silly-database").createCollection(collection);
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

/* User

userId: "719861561526845461"
points: [
  {
    guild: "1176304301853921330",
    value: "500"
  }
]
*/

async function getPoints(userId: string, guildId: string | null) {
  const user = await dbClient
    .db("silly-database")
    .collection("user")
    .findOne({ userId: userId });
  return user?.points.find((point: any) => point.guild === guildId)?.value ?? 0;
}

async function addPoints(
  userId: string,
  guildId: string | null,
  points: number
) {
  const user = await dbClient
    .db("silly-database")
    .collection("user")
    .findOne({ userId: userId });
  if (user) {
    // If user already has points in this guild, add to them
    const index = user.points.findIndex(
      (point: any) => point.guild === guildId
    );
    if (index === -1) {
      user.points.push({ guild: guildId, value: points });
    } else {
      user.points[index].value += points;
    }
    await dbClient
      .db("silly-database")
      .collection("user")
      .updateOne({ userId: userId }, { $set: { points: user.points } });
  } else {
    await dbClient
      .db("silly-database")
      .collection("user")
      .insertOne({
        userId: userId,
        points: [{ guild: guildId, value: points }],
      });
  }
}

/*
async function addPoints(userId: string, points: number) {
  const user = await dbClient
    .db("silly-database")
    .collection("user")
    .findOne({ userId: userId });
  if (user) {
    await dbClient
      .db("silly-database")
      .collection("user")
      .updateOne({ userId: userId }, { $set: { points: points } });
  } else {
    await dbClient
      .db("silly-database")
      .collection("user")
      .insertOne({ userId: userId, points: points });
  }
}
*/

export const db = {
  setup,
  getPoints,
  addPoints,
};
