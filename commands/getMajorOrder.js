const { SlashCommandBuilder } = require('discord.js');
const { fetchFromApi } = require('../utils/apiUtils');
const { logInfo, logError } = require('../utils/logger'); // Centralized logger

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getmajororder')
        .setDescription('Fetches raw data for a major order and logs it'),
    async execute(interaction) {
        try {
            // Fetch raw data from the API
            const rawData = await fetchFromApi('warAssignment'); // Endpoint key defined in apiLinks.json

            if (!rawData) {
                logError('Failed to fetch major order data.');
                return interaction.reply({
                    content: 'Failed to fetch major order data. Check the logs for details.',
                    ephemeral: true
                });
            }

            // Log the raw data to the file and console
            logInfo(`Raw Major Order Data:\n${JSON.stringify(rawData, null, 2)}`);

            // Confirm data fetch and logging to the user
            await interaction.reply({
                content: 'Major order data fetched and logged successfully. Check the logs for details.',
                ephemeral: true
            });
        } catch (error) {
            logError(`Error in getMajorOrder command: ${error.message}`);
            await interaction.reply({
                content: 'An error occurred while fetching the major order data. Check the logs for details.',
                ephemeral: true
            });
        }
    }
};
