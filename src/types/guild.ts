import { template_user } from "./guild_member";

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