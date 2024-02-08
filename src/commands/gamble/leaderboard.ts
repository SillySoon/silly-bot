import { CommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { db } from "../../database";

export const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("See the leaderboard of all cookies!")
  .addStringOption(option =>
		option.setName('category')
			.setDescription('cookies')
			.setRequired(true)
			.addChoices(
				{ name: 'Cookies', value: 'cookies' },
			));

export async function execute(interaction: CommandInteraction) {
  // Get selected category
  const category: any = interaction.options.get('category');

  switch (category.value) {
    case 'cookies':
      await cookieLeaderboard(interaction);
      break;
  }
}

async function cookieLeaderboard(interaction: CommandInteraction) {
  // Get the top 10 users with the most points
  const users = await db.guild.member.points.getTop(interaction.guildId, 10);

  if (!users) {
    const embed = new EmbedBuilder()
      .setColor("#eeeee4")
      .setTitle("Cookie Leaderboard")
      .setDescription("No one has any cookies yet!");

    return interaction.reply({ embeds: [embed], ephemeral: true });
  } else {
    const embed = new EmbedBuilder()
    .setColor("#eeeee4")
    .setTitle("Cookie Leaderboard")
    // Add the top 10 users to the embed
    // Add Emotes to 1st, 2nd, and 3rd place (🥇, 🥈, 🥉)
    .setDescription(
      users
        .map((user, index) => {
          if (index === 0) {
            return `🥇 <@${user.id}>: \`${user.points}\``;
          } else if (index === 1) {
            return `🥈 <@${user.id}>: \`${user.points}\``;
          } else if (index === 2) {
            return `🥉 <@${user.id}>: \`${user.points}\``;
          } else {
            return `**#${index + 1}** <@${user.id}>: \`${user.points}\``;
          }
        })
        .join("\n")
    );
  

  await interaction.reply({ embeds: [embed] });
  }
}