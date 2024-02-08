import { dbClient, dbName } from "./mongo";

/* Guild Setup
guildId: "1143902394871201924"
counting {
  active: true,
  channel: "1143910892522717284",
  value: 0
  user: "421772263864401921"
}
*/

async function get(userId: string, guildId: string | null) {
  const user = await dbClient
    .db(dbName)
    .collection("user")
    .findOne({ userId: userId });
  return user?.points.find((point: any) => point.guild === guildId)?.value ?? 0;
}

async function add(
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
async function getTop(guildId: string | null, limit: number) {
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

export const points = {
    get,
    add,
    getTop
};
