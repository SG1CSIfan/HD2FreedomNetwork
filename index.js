const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { logInfo, logError } = require('./utils/logger'); // Centralized logger
const fs = require('fs');
require('dotenv').config(); // Load sensitive info from .env

// Load settings for non-sensitive configuration
const settings = require('./data/settings.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
client.commands = new Collection();
client.settings = settings; // Attach settings for general use

// Load command and event handlers
try {
    logInfo('Loading command handlers...');
    require('./handlers/commandHandler').registerCommands(client);
    logInfo('Command handlers loaded successfully.');

    logInfo('Loading event handlers...');
    require('./handlers/eventHandler').registerEvents(client);
    logInfo('Event handlers loaded successfully.');
} catch (error) {
    logError(`Failed to load handlers: ${error.message}`);
    process.exit(1); // Exit the process if handlers fail to load
}

// Start the bot
client.login(process.env.DISCORD_BOT_TOKEN)
    .then(() => logInfo('Bot started successfully.'))
    .catch(err => {
        logError(`Failed to login: ${err.message}`);
        process.exit(1); // Exit the process if login fails
    });

// Start periodic updates
try {
    logInfo('Starting periodic updates...');
    const { startPeriodicUpdates } = require('./handlers/periodicUpdateHandler');
    startPeriodicUpdates(client);
    logInfo('Periodic updates started successfully.');
} catch (error) {
    logError(`Failed to start periodic updates: ${error.message}`);
    process.exit(1); // Exit the process if periodic updates fail
}

// Graceful shutdown
process.on('SIGINT', () => {
    logInfo('Bot is shutting down (SIGINT received).');
    client.destroy(); // Clean up Discord client
    process.exit(0);
});

process.on('SIGTERM', () => {
    logInfo('Bot is shutting down (SIGTERM received).');
    client.destroy(); // Clean up Discord client
    process.exit(0);
});
