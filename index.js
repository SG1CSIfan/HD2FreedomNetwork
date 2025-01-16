const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Load command and event handlers
require('./handlers/commandHandler').registerCommands(client);
require('./handlers/eventHandler').registerEvents(client);

// Start the bot
client.login(process.env.DISCORD_BOT_TOKEN)
    .then(() => console.log('[INFO] Bot started successfully.'))
    .catch(err => console.error('[ERROR] Failed to login:', err));
