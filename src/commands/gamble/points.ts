import {
  CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { db } from "../../utils/db";

export const data = new SlashCommandBuilder()
  .setName("points")
  .setDescription("See how many points yo have!");

export async function execute(interaction: CommandInteraction) {
  const points = await db.getPoints(interaction.user.id, interaction.guildId);

  const embed = new EmbedBuilder()
    .setColor("#eeeee4")
    .setTitle("Points")
    .setDescription(`You have ${points} points!`);

  await interaction.reply({ embeds: [embed] });
}
