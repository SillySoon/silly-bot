import { dbClient, dbName } from "./mongo";
import { logger } from "silly-logger";

import { template_user } from "./guild";

// add member to guild
async function add(guildId: string | null, userId: string) {
    let template: template_user = new Object() as template_user;
    template.id = userId;
    template.points = 0;

    try {
        await dbClient
            .db(dbName)
            .collection("guild")
            .updateOne(
                { id: guildId },
                { $push: { members: template } },
                { upsert: true }
            );
    } catch (err) {
        logger.error(`Error occurred while adding member to guild in database:\n ${err}`);
    }
}

export const member = {
    add,
};