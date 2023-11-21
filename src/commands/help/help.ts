import { CommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Gives helpful commands!");

export async function execute(interaction: CommandInteraction) {
    const embed = new EmbedBuilder()
    .setColor('#eeeee4')
    .setTitle('All commands');

    embed.addFields(
        { name: '❓ Help', value: '`/help`' },
        { name: '🔰 Other', value: '`/ping`' },
    );

  await interaction.reply({ embeds: [embed] });
}