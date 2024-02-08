import { dbClient, dbName } from "./mongo";

/* User
userId: "719861561526845461"
points: [
  {
    guild: "1176304301853921330",
    value: "500"
  }
]
*/

// Change counting status
async function setStatus(guildId: string, active: boolean) {
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
async function setChannel(guildId: string, channel: string) {
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
async function setValue(guildId: string | null, value: number) {
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
async function setUser(guildId: string | null, userId: string) {
  await dbClient
    .db(dbName)
    .collection("guild")
    .updateOne(
      { guildId: guildId },
      { $set: { "counting.user": userId } },
      { upsert: true }
    );
}

export const counting = {
  setStatus,
  setChannel,
  setValue,
  setUser,
};
