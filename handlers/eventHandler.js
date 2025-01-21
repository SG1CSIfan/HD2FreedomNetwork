const { logInfo, logError } = require('../utils/logger'); // Centralized logger

function registerEvents(client) {
    client.once('ready', () => {
        logInfo(`Bot is online as ${client.user.tag}`);
    });

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) {
            logError(`Command not found: ${interaction.commandName}`);
            return interaction.reply({ content: 'Command not found.', ephemeral: true });
        }

        try {
            logInfo(`Executing command: ${interaction.commandName}`);
            await command.execute(interaction);
            logInfo(`Command executed successfully: ${interaction.commandName}`);
        } catch (error) {
            logError(`Command execution failed for ${interaction.commandName}: ${error.message}`);
            await interaction.reply({ content: 'An error occurred while executing this command.', ephemeral: true });
        }
    });
}

module.exports = { registerEvents };