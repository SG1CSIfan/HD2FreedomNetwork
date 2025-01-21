const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { logInfo, logError } = require('../utils/logger'); // Centralized logger
require('dotenv').config();

async function registerCommands(client) {
    const commands = [];
    const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

    // Load commands dynamically
    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        logInfo(`Command loaded: ${command.data.name}`);
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

    try {
        logInfo(`Registering ${commands.length} commands for guild ${process.env.DISCORD_GUILD_ID}...`);
        await rest.put(
            Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
            { body: commands }
        );
        logInfo('Commands registered successfully!');
    } catch (error) {
        logError(`Failed to register commands: ${error.message}`);
    }
}

module.exports = { registerCommands };