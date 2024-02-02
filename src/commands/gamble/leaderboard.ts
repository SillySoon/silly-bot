import {
  CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  CacheType,
} from "discord.js";
import { db } from "../../utils/db";

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
  const users = await db.getTopPoints(interaction.guildId, 10);

  const embed = new EmbedBuilder()
    .setColor("#eeeee4")
    .setTitle("Cookie Leaderboard")
    // Add the top 10 users to the embed
    // Add Emotes to 1st, 2nd, and 3rd place (🥇, 🥈, 🥉)
    .setDescription(
      users
        .map((user, index) => {
          if (index === 0) {
            return `🥇 <@${user.userId}>: \`${user.points}\``;
          } else if (index === 1) {
            return `🥈 <@${user.userId}>: \`${user.points}\``;
          } else if (index === 2) {
            return `🥉 <@${user.userId}>: \`${user.points}\``;
          } else {
            return `**#${index + 1}** <@${user.userId}>: \`${user.points}\``;
          }
        })
        .join("\n")
    );
  

  await interaction.reply({ embeds: [embed] });
}