import { dbClient, dbName } from "../../mongo";
import * as logger from "silly-logger";

// change points enable status
async function enable(guildId: string, enable: boolean) {
    try {
        await dbClient
            .db(dbName)
            .collection("guild")
            .updateOne(
                { id: guildId },
                { $set: { "modules.$[element].enable": enable } },
                { arrayFilters: [{ "element.name": "points" }] }
            );
        logger.info(`Changing points enable status to ${enable} in guild ${guildId} in database`);
    }
    catch (err) {
        logger.error(`Error occurred while changing points enable status in database:\n ${err}`);
    }
}

// Export functions
export const points = {
    enable,
};