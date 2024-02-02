import {
  CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { db } from "../../utils/db";
import * as logger from "silly-logger";

export const data = new SlashCommandBuilder()
  .setName("gamble")
  .setDescription("Gamble points!")
  .addStringOption((option) =>
    option
      .setName("amount")
      .setRequired(true)
      .setDescription("The amount of points to gamble")
  );

export async function execute(interaction: CommandInteraction) {
  let amount = interaction.options.get("amount")?.value ?? "No amount provided";

  amount = Number(amount);

  if (isNaN(amount)) {
    const embed = new EmbedBuilder()
      .setColor("#eeeee4")
      .setTitle("Invalid amount!")
      .setDescription("Please provide a valid amount of points to gamble!");

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Get the user's points
  db.getPoints(interaction.user.id, interaction.guildId).then((points) => {
    if (points < amount) {
      const embed = new EmbedBuilder()
        .setColor("#eeeee4")
        .setTitle("You don't have enough points!")
        .setDescription(
          `You only have ${points} points, you can't gamble ${amount} points!`
        );

      return interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (Number(amount) <= 0) {
      const embed = new EmbedBuilder()
        .setColor("#eeeee4")
        .setTitle("Invalid amount!")
        .setDescription("You can't gamble less or equal then 0 points!");

      return interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      // Gamble the points
      const embed = new EmbedBuilder().setColor("#eeeee4");

      // Random number between 1 and 100
      const random = Math.floor(Math.random() * 100) + 1;

      // 50% chance of winning
      if (random > 50) {
        embed.setTitle(`<:positive:1203089362833768468> You won!`);
        embed.setDescription(
          `You have won ${amount} cookies!\nYou now have ${
            points + Number(amount)
          } cookies in your balance!`
        );
        db.addPoints(interaction.user.id, interaction.guildId, Number(amount));
      } else {
        embed.setTitle(`<:negative:1203089360644476938> You lost!`);
        embed.setDescription(
          `You have lost ${amount} cookies!\nYou now have ${
            points - Number(amount)
          } cookies in your balance!`
        );
        db.addPoints(interaction.user.id, interaction.guildId, Number(-amount));
      }

      return interaction.reply({ embeds: [embed] });
    }
  });
}
