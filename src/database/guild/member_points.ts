import { dbClient, dbName } from "../mongo";
import * as logger from "silly-logger";
import { db } from "../index";

// add points to member
async function add(guildId: string | null, userId: string, points: number) {
    try {
        await dbClient
            .db(dbName)
            .collection("guild")
            .updateOne(
                { id: guildId, "members.id": userId },
                { $inc: { "members.$.points": points } }
            );
        logger.info(`Adding ${points} points to member ${userId} in guild ${guildId} in database`);
    } catch (err) {
        logger.error(`Error occurred while adding points to member in database:\n ${err}`);
    }
}

// get member points
async function get(guildId: string | null, userId: string) {
    try {
        const guild = await dbClient
            .db(dbName)
            .collection("guild")
            .findOne({ id: guildId, "members.id": userId });

        return guild?.members.find((member: any) => member.id === userId).points;
    } catch (err) {
        logger.error(`Error occurred while getting member points from database:\n ${err}`);
        return null;
    }
}

// get top points
async function getTop(guildId: string | null, limit: number) {
    try {
        const guild = await db.guild.get(guildId);
        const guildMembers: Array<any> = guild?.members;
        return guildMembers.sort((a: any, b: any) => b.points - a.points).slice(0, limit);
    } catch (err) {
        logger.error(`Error occurred while getting top points from database:\n ${err}`);
        return null;
    }
}

// Export functions
export const points = {
    add,
    get,
    getTop,
};
