const { fetchMajorOrder, updateVcChannelName } = require('./majorOrderHandler');
const { logInfo, logError } = require('../utils/logger'); // Centralized logger

/**
 * Starts periodic updates for Major Orders, including VC name updates.
 * @param {Client} client - The Discord.js client.
 */
function startPeriodicUpdates(client) {
    const settings = client.settings;
    const updateInterval = settings.UPDATE_INTERVAL_SECONDS || 3600; // Default to 1 hour
    const safeInterval = Math.max(updateInterval, 2); // Minimum safe interval is 2 seconds

    logInfo(`Starting periodic updates every ${safeInterval} seconds.`);

    setInterval(async () => {
        logInfo('Performing periodic major order check...');
        try {
            const majorOrder = await fetchMajorOrder(client); // Fetch and validate data
            if (majorOrder) {
                await updateVcChannelName(client, majorOrder); // Update VC channel name
            } else {
                logError('Major Order data is invalid. Skipping VC name update.');
            }
            logInfo('Periodic update completed successfully.');
        } catch (err) {
            logError(`Failed during periodic update: ${err.message}`);
        }
    }, safeInterval * 1000); // Convert seconds to milliseconds
}

module.exports = { startPeriodicUpdates };
