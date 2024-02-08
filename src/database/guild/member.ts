import { dbClient, dbName } from "../mongo";
import { template_user } from "../../types";
import * as logger from "silly-logger";

// add member to guild
async function add(guildId: string | null, userId: string) {
    // check if member already exists
    const member = await get(guildId, userId);
    if (member) return;

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
        logger.info(`Adding member ${userId} to guild ${guildId} in database`);
    } catch (err) {
        logger.error(`Error occurred while adding member to guild in database:\n ${err}`);
    }
}

// remove member from guild
async function remove(guildId: string | null, userId: string) {
    try {
        await dbClient
            .db(dbName)
            .collection("guild")
            .updateOne(
                { id: guildId },
                { $pull: { members: { id: userId } } }
            );
        logger.info(`Removing member ${userId} from guild ${guildId} in database`);
    } catch (err) {
        logger.error(`Error occurred while removing member from guild in database:\n ${err}`);
    }
}

// get member from guild
async function get(guildId: string | null, userId: string) {
    try {
        const guild = await dbClient
            .db(dbName)
            .collection("guild")
            .findOne({ id: guildId, "members.id": userId });

        return guild?.members.find((member: any) => member.id === userId);
    } catch (err) {
        logger.error(`Error occurred while getting member from guild in database:\n ${err}`);
        return null;
    }
}

import { points } from "./member_points";

export const member = {
    points,
    add,
    remove,
    get,
};