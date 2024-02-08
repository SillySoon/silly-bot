import {
    CommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
  } from "discord.js";
  
  export const data = new SlashCommandBuilder()
    .setName("help")
    .setDescription("All my commands that i can do!");
  
  export async function execute(interaction: CommandInteraction) {
    const embed = new EmbedBuilder()
        .setColor("#eeeee4")
        .setTitle("What I can do!")
        .setDescription(`[] = Needed argument\n() = Optional argument`)
        .addFields(
            { name: `❓ \`/help\``, value: `> This command gives you a list of commands to use with this Bot.`, inline: true },
            { name: `💵 \`/points\``, value: `> This command will show you yor current points`, inline: true },
            { name: `🎰 \`/gamble [amount]\``, value: `> This command let's you gamble your points`, inline: true },
            { name: `🏆 \`/leaderboard [categorie]\``, value: `> This command gives you various leaderboards`, inline: true },
            { name: `🔩 \`/botinfo\``, value: `> Shows some technical stuff about me.`, inline: true },
        )
        .setFooter({ text: `Send for ${interaction.user.tag}` })
        .setTimestamp();
  
    await interaction.reply({ embeds: [embed] });
  }
  