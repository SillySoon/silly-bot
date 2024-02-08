import { CommandInteraction, SlashCommandBuilder, EmbedBuilder, } from "discord.js";
import { version } from "../../../package.json";
import si from "systeminformation";
  
export const data = new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Shows some technical stuff about me.");
  
export async function execute(interaction: CommandInteraction) {
    // Reply first that bot can handle await requests
    await interaction.deferReply({ ephemeral: true });

    //  Get Information
    const servers: number = interaction.client.guilds.cache.size;

    let memUsed: string = "";
    let memTotal: string = "";
    let memPercentage: string = "";
    let osPlatform: string = "";
    let osKernal: string = "";

    await si.mem(function(data) {
        memUsed = (data.used / 1073741824).toFixed(2);
        memTotal = (data.total / 1073741824).toFixed(2);
        memPercentage = ((Number(memUsed) / Number(memTotal) * 100).toFixed(0));
    });
    await si.osInfo(function(data) {
        osPlatform = (data.platform);
        osKernal = (data.kernel);
    });

    // Create Embed
    const embed = new EmbedBuilder()
        .setColor("#eeeee4")
        .setTitle('SillyBot')
        .setDescription(`> Version: **v${version}**\n> OS: **${osPlatform} ${osKernal}**\n> RAM: **${memUsed}GB/${memTotal}GB (${memPercentage}%)**\n> Latency: **${Math.abs(Date.now() - interaction.createdTimestamp)}ms**\n> API-Latency: **${Math.round(interaction.client.ws.ping)}ms**\n> Servers: **${servers}**`)
        .setFooter({ text: `Send for ${interaction.user.tag}` })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}
  