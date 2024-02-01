import {
  CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!");

export async function execute(interaction: CommandInteraction) {
  const embed = new EmbedBuilder()
    .setColor("#eeeee4")
    .setTitle("Pong!")
    .setDescription(
      `That took ${Math.abs(
        Date.now() - interaction.createdTimestamp
      )}ms.\n\nAPI Latency is ${Math.round(interaction.client.ws.ping)}ms`
    );

  await interaction.reply({ embeds: [embed] });
}
