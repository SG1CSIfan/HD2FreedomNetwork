const { SlashCommandBuilder } = require('discord.js');
const { logInfo } = require('../utils/logger'); // Centralized logger

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        logInfo('Ping command executed.');
        await interaction.reply('Pong!');
    },
};
