import {
  CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { db } from "../../utils/db";

export const data = new SlashCommandBuilder()
  .setName("cookies")
  .setDescription("See how many cookies you have!");

export async function execute(interaction: CommandInteraction) {
  const points = await db.getPoints(interaction.user.id, interaction.guildId);

  const embed = new EmbedBuilder()
    .setColor("#eeeee4")
    .setTitle("Cookie Balance")
    .setDescription(`You have **${points}** cookies inside your pockets!`);

  await interaction.reply({ embeds: [embed] });
}
