import {
  CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";

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
  const amount =
    interaction.options.get("amount")?.value ?? "No amount provided";

  const embed = new EmbedBuilder()
    .setColor("#eeeee4")
    .setTitle(`You gambled points!`);

  // Random number between 1 and 100
  const random = Math.floor(Math.random() * 100) + 1;

  // 50% chance of winning
  if (random > 50) {
    embed.setDescription(`You won ${amount} points!`);
  } else {
    embed.setDescription(`You lost ${amount} points!`);
  }

  await interaction.reply({ embeds: [embed] });
}
