import { CommandInteraction, SlashCommandBuilder, EmbedBuilder, Client, User  } from "discord.js";
import { MongoClient, Collection } from 'mongodb';
import { config } from "../../utils/config";
import * as logger from "silly-logger";

const dbClient = new MongoClient(String(config.MONGODB_URI));

export const data = new SlashCommandBuilder()
    .setName("notes")
    .setDescription("Write down some notes!")
    .addSubcommand(subcommand =>
        subcommand
            .setName('view')
            .setDescription('View notes'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('create')
            .setDescription('Create notes')
            .addStringOption(option =>
                option.setName('title')
                    .setDescription('Title of your note')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('note')
                    .setDescription('Write down your note')
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('update')
            .setDescription('Update notes'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('delete')
            .setDescription('Delete notes'))

export async function execute(interaction: CommandInteraction) {
    await dbClient.connect();

    const db = dbClient.db("silly-database");
    const collection: Collection = db.collection('notes');

    // Create Embed standarts
    const embed = new EmbedBuilder()
        .setColor('#eeeee4')
        .setTimestamp()

    // Subcommand check
    let subcommand: string = interaction.options.getSubcommand();
    let inputTitle: string = interaction.options.getString('title');
    let inputNote: string = interaction.options.getString('note');
    let interactionUser: User = interaction.user;

    interface Note {
        title: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
        userID: string;
    }

    switch (subcommand) {
        case 'view':
            
            break;

        case 'create':
            let newNote: Note = {
                title: `${inputTitle}`,
                content: `${inputNote}`,
                createdAt: new Date(),
                updatedAt: new Date(),
                userID: interactionUser.id,
            };

            // Check the count of existing notes for the user
            const existingNotesCount: number = await collection.countDocuments({ userID: interactionUser.id });

            // If less than 3 notes, insert the new note
            if (existingNotesCount < 3) {
                await collection.insertOne(newNote);
                embed.setTitle('New note created.');
            } else {
                embed.setTitle('You already has 3 notes.');
            }
            break;

        case 'update':
            
            break;

        case 'delete':
            
            break;
    
        default:
            logger.error('Error in notes.ts');
            break;
    }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}