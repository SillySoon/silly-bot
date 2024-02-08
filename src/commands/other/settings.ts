import { CommandInteraction, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { db } from "../../database";
  
export const data = new SlashCommandBuilder()
    .setName("settings")
    .setDescription("See all your settings!")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
        subcommand
            .setName('counting')
            .setDescription('Manage counting module settings')
            .addBooleanOption(option => option.setName('enable').setDescription('Enable/Disable counting module'))
            .addChannelOption(option => option.setName('channel').setDescription('Channel to use counting module'))
            );
    
  
export async function execute(interaction: CommandInteraction) {
    let settings = await db.guild.get(interaction.guildId);

    switch (interaction.options.getSubcommand()) {
        case 'counting':
            return await counting(interaction, settings);
    }
    /*

    // enabled <:positive:1203089362833768468> 
    // not fully enabled <:special:1203137023196663908> 
    // disabled <:negative:1203089360644476938>
    let correct: Array<string> = [];
    if (settings) {
        // counting module
        if (settings.modules[1].enable && settings.modules[1].channel) {
            correct.push(`<:positive:1203089362833768468> Counting`);
        } else if (!settings.modules[1].enable && !settings.modules[1].channel) {
            correct.push(`<:negative:1203089360644476938> Counting`);
        } else {
            correct.push(`<:special:1203137023196663908> Counting`);
        }
    }

    const embed = new EmbedBuilder()
        .setColor("#eeeee4")
        .setTitle("Settings")
        .addFields(
            { name: `Modules`, value: `> ${correct[1]}`, inline: true },
        )
  
    await interaction.reply({ embeds: [embed] });
    */
}
  

async function counting(interaction: CommandInteraction, settings: any) {
    let enable = interaction.options.get('enable')?.value;
    let channel = interaction.options.get('channel')?.value;

    if (enable == undefined && channel == undefined) {
        return await interaction.reply({ content: "No Settings selected!", ephemeral: true });
    }
    if (enable != undefined) {
        await db.guild.modules.counting.enable(interaction.guildId, Boolean(enable));
    }
    if (channel != undefined) {
        await db.guild.modules.counting.changeChannel(interaction.guildId, String(channel));
    }

    const embed = new EmbedBuilder()
        .setColor("#eeeee4")
        .setTitle("Settings updated!")
        .setDescription(`> Enabled: ${enable}\n> Channel: <#${channel}>`);
  
    return await interaction.reply({ embeds: [embed], ephemeral: true });
}