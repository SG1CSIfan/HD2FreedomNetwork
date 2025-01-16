function registerEvents(client) {
    client.once('ready', () => {
        console.log(`[INFO] Bot is online as ${client.user.tag}`);
    });

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) {
            return interaction.reply({ content: 'Command not found.', ephemeral: true });
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('[ERROR] Command execution failed:', error);
            await interaction.reply({ content: 'An error occurred while executing this command.', ephemeral: true });
        }
    });
}

module.exports = { registerEvents };
