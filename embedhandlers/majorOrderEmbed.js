const { EmbedBuilder } = require('discord.js');
const { renderCustomProgressBar } = require('../utils/progressBar');
const { logInfo, logError } = require('../utils/logger'); // Centralized logger
const fs = require('fs');
const path = require('path');

// Load custom emoji mappings
const emojiMap = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/emojiMap.json')));

// Static text or configuration
const EMBED_TITLE_SUFFIX = 'THIS IS IN ALPHA';
const EMBED_FOOTER_TEXT = 'Freedom News Network | Inspired by Winter-06 | v. 1.0.0';

/**
 * Creates an enhanced embed for the major order.
 * @param {Object} majorOrder - The major order data from the API.
 * @returns {EmbedBuilder} - The Discord.js embed object.
 */
function createMajorOrderEmbed(majorOrder) {
    try {
        const task = majorOrder.setting.tasks[0];
        const progress = majorOrder.progress[0];
        const total = task.values[0]; // Total required (e.g., "14")
        const progressPercent = ((progress / total) * 100).toFixed(2);

        const timeRemaining = majorOrder.expiresIn;
        const endTimestamp = Math.floor(Date.now() / 1000) + timeRemaining; // Unix timestamp for the end

        // Task and faction mapping
        const taskType = task.type === 12 ? 'Defense' : 'Unknown Task';
        const faction = task.values[1] === 4 ? `${emojiMap.Illuminate} Illuminate` : 'Unknown Faction';

        // Reward mapping
        const reward = majorOrder.setting.reward;
        const rewardType = emojiMap[reward.type] || emojiMap.DefaultReward;

        // Build the embed
        const embed = new EmbedBuilder()
            .setColor('#FFD700') // Gold color
            .setTitle(`${emojiMap.Alert} Major Order ${emojiMap.Alert} | ${EMBED_TITLE_SUFFIX}`)
            .setDescription(`> \`\`\`Use the repaired DSS to repel the ongoing Illuminate invasions.\`\`\``)
            .addFields(
                {
                    name: `** **`,
                    value: `> ${emojiMap.TaskIncomplete} Defend against ${total} attacks from the ${faction}.`,
                    inline: false,
                },
                {
                    name: 'Progress',
                    value: `Current progress: **${progress}/${total}**\n${renderCustomProgressBar(progress, total, emojiMap)} **${progressPercent}%**`,
                    inline: false,
                },
                {
                    name: 'Rewards',
                    value: `${reward.amount} ${rewardType}`,
                    inline: true,
                },
                {
                    name: 'Ends',
                    value: `<t:${endTimestamp}:R> (<t:${endTimestamp}:F>)`,
                    inline: true,
                },
                {
                    name: 'Message ID',
                    value: `\`#${majorOrder.id32}\``,
                    inline: false,
                }
            )
            .setFooter({ text: EMBED_FOOTER_TEXT });

        logInfo(`Embed created for Major Order ID: ${majorOrder.id32}`);
        return embed;
    } catch (error) {
        logError(`Failed to create embed: ${error.message}`);
        throw error; // Ensure the error propagates to calling functions
    }
}

module.exports = { createMajorOrderEmbed };
