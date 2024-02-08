import {
  CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { db } from "../../database";

export const data = new SlashCommandBuilder()
  .setName("points")
  .setDescription("See how many cookies you have!");

export async function execute(interaction: CommandInteraction) {
  const points = await db.guild.member.points.get(interaction.guildId, interaction.user.id);

  const embed = new EmbedBuilder()
    .setColor("#eeeee4")
    .setTitle("Cookie Balance")
    .setDescription(`You have **${points}** cookies inside your pockets!`);

  await interaction.reply({ embeds: [embed] });
}
