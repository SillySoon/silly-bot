import { MongoClient } from "mongodb";
import { config } from "./config";
import logger from "silly-logger";

// Connecting to MongoDB
const dbClient = new MongoClient(String(config.MONGODB_URI));
let dbName: string;

async function setup() {
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
  const collections = await dbClient
    .db(dbName)
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
    .db(dbName)
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
    .db(dbName)
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
      .db(dbName)
      .collection("user")
      .updateOne({ userId: userId }, { $set: { points: user.points } });
  } else {
    await dbClient
      .db(dbName)
      .collection("user")
      .insertOne({
        userId: userId,
        points: [{ guild: guildId, value: points }],
      });
  }
}

// Get top points
async function getTopPoints(guildId: string | null, limit: number) {
  const users = await dbClient
    .db(dbName)
    .collection("user")
    .find({ "points.guild": guildId })
    .sort({ "points.value": -1 })
    .limit(limit)
    .toArray();
  return users.map((user) => {
    return {
      userId: user.userId,
      points: user.points.find((point: any) => point.guild === guildId).value,
    };
  });
}

/* Guild Setup
guildId: "1143902394871201924"
counting {
  active: true,
  channel: "1143910892522717284",
  value: 0
  user: "421772263864401921"
}
*/

// get guild counting from database
async function getGuild(guildId: string | null) {
  return await dbClient
    .db(dbName)
    .collection("guild")
    .findOne({ guildId: guildId });
}


// Add guild to database
async function addGuild(guildId: string) {
  let template = {
    guildId: guildId,
    counting: {
      active: false,
      channel: "",
      value: 1,
      user: "",
    },
  };

  await dbClient
    .db(dbName)
    .collection("guild")
    .insertOne({ template });
}

// delete guild from database
async function deleteGuild(guildId: string) {
  await dbClient
    .db(dbName)
    .collection("guild")
    .deleteOne({ guildId: guildId });
}

// Change counting status
async function setCountingStatus(
  guildId: string,
  active: boolean
) {
  await dbClient
    .db(dbName)
    .collection("guild")
    .updateOne(
      { guildId: guildId },
      { $set: { "counting.active": active } },
      { upsert: true }
    );
}

// change counting channel
async function setCountingChannel(
  guildId: string,
  channel: string
) {
  await dbClient
    .db(dbName)
    .collection("guild")
    .updateOne(
      { guildId: guildId },
      { $set: { "counting.channel": channel } },
      { upsert: true }
    );
}

// change counting value
async function setCountingValue(
  guildId: string | null,
  value: number
) {
  await dbClient
    .db(dbName)
    .collection("guild")
    .updateOne(
      { guildId: guildId },
      { $set: { "counting.value": value } },
      { upsert: true }
    );
}

// set user for counting
async function setCountingUser(
  guildId: string | null,
  userId: string
) {
  await dbClient
    .db(dbName)
    .collection("guild")
    .updateOne(
      { guildId: guildId },
      { $set: { "counting.user": userId } },
      { upsert: true }
    );
}


export const db = {
  setup,
  getPoints,
  addPoints,
  getTopPoints,
  getGuild,
  addGuild,
  deleteGuild,
  setCountingStatus,
  setCountingChannel,
  setCountingValue,
  setCountingUser,
};
