import { dbClient, dbName } from "../../mongo";
import * as logger from "silly-logger";

// change counting enable status
async function enable(guildId: string | null, enable: boolean) {
    try {
        await dbClient
            .db(dbName)
            .collection("guild")
            .updateOne(
                { id: guildId },
                { $set: { "modules.$[element].enable": enable } },
                { arrayFilters: [{ "element.name": "counting" }] }
            );
        logger.info(`Changing counting enable status to ${enable} in guild ${guildId} in database`);
    }
    catch (err) {
        logger.error(`Error occurred while changing counting enable status in database:\n ${err}`);
    }
}

// change counting channel
async function changeChannel(guildId: string | null, channelId: string) {
    try {
        await dbClient
            .db(dbName)
            .collection("guild")
            .updateOne(
                { id: guildId },
                { $set: { "modules.$[element].channel": channelId } },
                { arrayFilters: [{ "element.name": "counting" }] }
            );
        logger.info(`Changing counting channel to ${channelId} in guild ${guildId} in database`);
    }
    catch (err) {
        logger.error(`Error occurred while changing counting channel in database:\n ${err}`);
    }
}

// change counting value
async function changeValue(guildId: string | null, value: number) {
    try {
        await dbClient
            .db(dbName)
            .collection("guild")
            .updateOne(
                { id: guildId },
                { $set: { "modules.$[element].value": value } },
                { arrayFilters: [{ "element.name": "counting" }] }
            );
        logger.info(`Changing counting value to ${value} in guild ${guildId} in database`);
    }
    catch (err) {
        logger.error(`Error occurred while changing counting value in database:\n ${err}`);
    }
}

// change counting user
async function changeUser(guildId: string | null, userId: string) {
    try {
        await dbClient
            .db(dbName)
            .collection("guild")
            .updateOne(
                { id: guildId },
                { $set: { "modules.$[element].user": userId } },
                { arrayFilters: [{ "element.name": "counting" }] }
            );
        logger.info(`Changing counting user to ${userId} in guild ${guildId} in database`);
    }
    catch (err) {
        logger.error(`Error occurred while changing counting user in database:\n ${err}`);
    }
}

// get counting from database
async function get(guildId: string | null) {
    try {
        const guild = await dbClient
            .db(dbName)
            .collection("guild")
            .findOne({ id: guildId });
        return guild?.modules.find((module: any) => module.name === "counting");
    }
    catch (err) {
        logger.error(`Error occurred while getting counting from database:\n ${err}`);
        return null;
    }
}

// Export functions
export const counting = {
    enable,
    changeChannel,
    changeValue,
    changeUser,
    get,
};