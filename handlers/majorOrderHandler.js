const { fetchFromApi } = require('../utils/apiUtils');
const { createMajorOrderEmbed } = require('../embedhandlers/majorOrderEmbed');
const { logInfo, logError } = require('../utils/logger'); // Centralized logger
const fs = require('fs');
const path = require('path');

// Path to settings.json
const settingsFile = path.join(__dirname, '../data/settings.json');

/**
 * Fetches the major order data from the API and handles embed updates.
 * @param {Client} client - The Discord.js client.
 */
async function fetchMajorOrder(client) {
    logInfo('Fetching major order data...');
    const rawData = await fetchFromApi('warAssignment'); // Fetch data from API

    if (!rawData || rawData.length === 0) {
        logError('No major order data returned from the API.');
        return null; // Return null to signify invalid data
    }

    logInfo(`Raw Major Order Data: ${JSON.stringify(rawData[0], null, 2)}`); // Log raw data for debugging
    const majorOrder = rawData[0]; // Assuming the first object in the array is the active order

    // Validate the structure of the fetched data
    if (
        !majorOrder.setting ||
        !majorOrder.setting.tasks ||
        !Array.isArray(majorOrder.setting.tasks) ||
        majorOrder.setting.tasks.length === 0 ||
        !majorOrder.setting.tasks[0].type ||
        !majorOrder.setting.tasks[0].values
    ) {
        logError('Invalid Major Order data structure. Skipping update.');
        return null;
    }

    // Load settings
    let settings;
    try {
        settings = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
    } catch (error) {
        logError(`Failed to load settings: ${error.message}`);
        return null;
    }

    const channelId = settings.MAJOR_ORDER_CHANNEL_ID;
    const embedId = settings.MAJOR_ORDER_EMBED_ID;

    // Compare ID and handle embed updates
    if (settings.MAJOR_ORDER_ID === majorOrder.id32) {
        logInfo(`Major order ID matches the cached data (ID: ${majorOrder.id32}). Updating the embed...`);
        if (!embedId) {
            logError('No embed ID stored. Posting a new embed instead.');
            await postNewMajorOrderEmbed(client, majorOrder, channelId);
        } else {
            await updateMajorOrderEmbed(client, majorOrder, channelId, embedId);
        }
    } else {
        logInfo(`New major order detected (ID: ${majorOrder.id32}). Posting a new embed...`);
        await postNewMajorOrderEmbed(client, majorOrder, channelId);

        // Update settings with the new major order ID and reset the embed ID
        settings.MAJOR_ORDER_ID = majorOrder.id32;
        settings.MAJOR_ORDER_EMBED_ID = null;
        try {
            fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
            logInfo(`Updated settings.json with new major order ID: ${majorOrder.id32}`);
        } catch (error) {
            logError(`Failed to update settings.json: ${error.message}`);
        }
    }

    return majorOrder; // Return validated Major Order
}

/**
 * Updates an existing embed for the major order.
 * @param {Client} client - The Discord.js client.
 * @param {Object} majorOrder - The major order data.
 * @param {string} channelId - The Discord channel ID.
 * @param {string} embedId - The embed message ID.
 */
async function updateMajorOrderEmbed(client, majorOrder, channelId, embedId) {
    try {
        logInfo(`Fetching channel with ID: ${channelId}`);
        const channel = client.channels.cache.get(channelId) || await client.channels.fetch(channelId);
        if (!channel) {
            logError(`Channel with ID ${channelId} not found or unavailable.`);
            return;
        }

        logInfo(`Fetching message with ID: ${embedId}`);
        const message = await channel.messages.fetch(embedId).catch(() => null);
        if (!message) {
            logError(`Message with ID ${embedId} not found. Posting a new embed.`);
            await postNewMajorOrderEmbed(client, majorOrder, channelId);
            return;
        }

        logInfo('Updating embed...');
        const embed = createMajorOrderEmbed(majorOrder); // Generate the updated embed
        await message.edit({ embeds: [embed] });
        logInfo(`Updated embed for Major Order ID: ${majorOrder.id32} (Progress: ${majorOrder.progress[0]}/${majorOrder.setting.tasks[0].values[0]})`);
    } catch (error) {
        logError(`Failed to update embed: ${error.message}`);
    }
}

/**
 * Posts a new embed for the major order and stores the message ID in settings.json.
 * @param {Client} client - The Discord.js client.
 * @param {Object} majorOrder - The major order data.
 * @param {string} channelId - The Discord channel ID.
 */
async function postNewMajorOrderEmbed(client, majorOrder, channelId) {
    try {
        logInfo(`Fetching channel with ID: ${channelId}`);
        const channel = client.channels.cache.get(channelId) || await client.channels.fetch(channelId).catch(() => null);
        if (!channel) {
            logError(`Channel with ID ${channelId} not found or unavailable. Ensure the bot has access.`);
            return;
        }

        logInfo('Posting new embed...');
        const embed = createMajorOrderEmbed(majorOrder); // Generate the embed
        const sentMessage = await channel.send({ embeds: [embed] });

        // Update settings.json with the new embed ID and major order ID
        let settings = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
        settings.MAJOR_ORDER_EMBED_ID = sentMessage.id;
        settings.MAJOR_ORDER_ID = majorOrder.id32;
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));

        logInfo(`Posted new embed and updated settings.json with ID: ${sentMessage.id}`);
    } catch (error) {
        logError(`Failed to post new embed: ${error.message}`);
    }
}

/**
 * Updates the name of a voice channel with the current Major Order details.
 * @param {Client} client - The Discord.js client.
 * @param {Object} majorOrder - The major order data from the API.
 */
async function updateVcChannelName(client, majorOrder) {
    const settings = client.settings;
    const vcChannelId = settings.MO_DISPLAY_CHANNEL_ID;

    if (!vcChannelId) {
        logError('MO_DISPLAY_CHANNEL_ID is not set in settings.json. Cannot update VC name.');
        return;
    }

    try {
        logInfo(`Fetching VC channel with ID: ${vcChannelId}`);
        const channel = await client.channels.fetch(vcChannelId);

        if (!channel) {
            logError(`Channel with ID ${vcChannelId} not found.`);
            return;
        }
        if (channel.type !== 2) { // 2 = GuildVoice
            logError(`Channel with ID ${vcChannelId} is not a voice channel.`);
            return;
        }

        // Log the full Major Order object for debugging
        logInfo(`Major Order Data for VC Update: ${JSON.stringify(majorOrder, null, 2)}`);

        // Validate majorOrder data
        if (!majorOrder.setting || !majorOrder.setting.tasks || !Array.isArray(majorOrder.setting.tasks) || majorOrder.setting.tasks.length === 0) {
            logError('Invalid Major Order data structure. Skipping VC name update.');
            return;
        }

        const task = majorOrder.setting.tasks[0];
        if (!task.values || task.values.length < 2) {
            logError('Invalid Major Order task details. Skipping VC name update.');
            return;
        }

        // Determine the new VC name
        const taskType = task.type === 12 ? 'Defense' : 'Unknown Task';
        const faction = task.values[1] === 4 ? 'Illuminate' : 'Unknown Faction';

        const newVcName = `MO: ${taskType} ${faction}`;
        logInfo(`Proposed VC channel name: ${newVcName}`);

        if (channel.name !== newVcName) {
            logInfo(`Updating VC channel name from "${channel.name}" to "${newVcName}"`);
            await channel.setName(newVcName);
            logInfo(`Successfully updated VC channel name to: ${newVcName}`);
        } else {
            logInfo('VC channel name is already up-to-date.');
        }
    } catch (error) {
        logError(`Failed to update VC channel name: ${error.message}`);
    }
}

module.exports = { fetchMajorOrder, updateVcChannelName };
