import { dbClient, dbName } from "../mongo";
import { template_guild } from "../../types";
import * as logger from "silly-logger";

// get guild counting from database
async function get(guildId: string | null) {
    try {
        return await dbClient
            .db(dbName)
            .collection("guild")
            .findOne({ id: guildId });
    } catch (err) {
        logger.error(`Error occurred while getting guild from database:\n ${err}`);
        return null;
    }
}

// Add guild to database
async function add(guildId: string | null) {
    // check if guild already exists
    const checkExisting = await get(guildId);
    if (checkExisting) return;

    let guild: template_guild = new Object() as template_guild;
    guild.id = guildId;
    guild.members = [];
    guild.modules = [{
        name: "points",
        enable: true,
    }, {
        name: "counting",
        enable: false,
        channel: null,
        value: 1,
        user: null,
    }];

    try {
        await dbClient.db(dbName).collection("guild").insertOne(guild);
        logger.info(`Adding guild ${guildId} to database`);
    } catch (err: any) {
        logger.error(`Error occurred while adding guild to database:\n${err}`);
    }
}

// delete guild from database
async function remove(guildId: string) {
    try {
        await dbClient.db(dbName).collection("guild").deleteOne({ id: guildId });
        logger.info(`Removing guild ${guildId} from database`);
    } catch (err: any) {
        logger.error(`Error occurred while removing guild from database:\n${err}`);
    }
}

// Export functions
import { member } from "./member";

export const guild = {
    member,
    get,
    add,
    remove,
};