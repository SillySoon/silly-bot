import { dbClient, dbName } from "./mongo";
import { logger } from "silly-logger";

import { member } from "./guild_member";

// Guild template
export interface template_guild {
    id: string | null;
    members: Array<template_user> | null,
    modules: [
        {
            name: "points",
            enable: boolean,
        },
        { 
            name: "counting",
            enable: boolean,
            channel: string | null,
            value: number,
            user: string | null,
        },
    ],
};

// User template
export interface template_user {
    id: string,
    points: number,
};


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
    const guild = await get(guildId);
    if (guild) return;

    let template: template_guild = new Object() as template_guild;
    template.id = guildId;

    // Setup points module
    template.modules[0].enable = true;
    // Setup counting module
    template.modules[1].enable = false;
    template.modules[1].value = 1;

    try {
        await dbClient.db(dbName).collection("guild").insertOne({ template });
    } catch (err) {
        logger.error(`Error occurred while adding guild to database:\n ${err}`);
    }
}

// delete guild from database
async function remove(guildId: string) {
    try {
        await dbClient.db(dbName).collection("guild").deleteOne({ id: guildId });
    } catch (err) {
        logger.error(`Error occurred while removing guild from database:\n ${err}`);
    }
}

export const guild = {
    member,
    get,
    add,
    remove,
};