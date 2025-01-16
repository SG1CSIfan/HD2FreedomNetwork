const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
require('dotenv').config();

async function registerCommands(client) {
    const commands = [];
    const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

    // Load commands dynamically
    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        console.log(`[INFO] Command loaded: ${command.data.name}`);
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

    try {
        console.log(`[INFO] Registering ${commands.length} commands for guild ${process.env.DISCORD_GUILD_ID}...`);
        await rest.put(
            Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
            { body: commands }
        );
        console.log('[INFO] Commands registered successfully!');
    } catch (error) {
        console.error('[ERROR] Failed to register commands:', error);
    }
}

module.exports = { registerCommands };
