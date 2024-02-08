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

// get guild counting from database
async function get(guildId: string | null) {
  return await dbClient
    .db(dbName)
    .collection("guild")
    .findOne({ guildId: guildId });
}

// Add guild to database
async function add(guildId: string | null) {
  let template = {
    guildId: guildId,
    counting: {
      active: false,
      channel: "",
      value: 1,
      user: "",
    },
  };

  await dbClient.db(dbName).collection("guild").insertOne({ template });
}

// delete guild from database
async function remove(guildId: string) {
  await dbClient.db(dbName).collection("guild").deleteOne({ guildId: guildId });
}

export const guild = {
  get,
  add,
  remove,
};
