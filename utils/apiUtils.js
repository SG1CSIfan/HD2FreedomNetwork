const apiLinks = require('../data/apiLinks.json');
const { logInfo, logError } = require('../utils/logger'); // Centralized logger

/**
 * Fetches data from the Helldivers 2 API using the built-in fetch API.
 * @param {string} endpointKey - The key for the endpoint in `apiLinks`.
 * @returns {Promise<Object|null>} - The JSON response or null on error.
 */
async function fetchFromApi(endpointKey) {
    const baseUrl = apiLinks.baseUrl;
    const endpoint = apiLinks.endpoints[endpointKey];

    if (!baseUrl || !endpoint) {
        logError(`API endpoint "${endpointKey}" is missing.`);
        return null;
    }

    const url = `${baseUrl}${endpoint}`;
    logInfo(`Fetching data from ${url}`);

    try {
        const response = await fetch(url, {
            headers: {
                'X-Super-Client': '1CR_Freedom_News_Network',
                'X-Super-Contact': 'SG1CSIfan@gmail.com'
            }
        });

        // Handle non-OK responses
        if (!response.ok) {
            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After') || 1;
                logError(`Rate limit hit. Retrying after ${retryAfter} seconds.`);
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                return fetchFromApi(endpointKey); // Retry the request
            }
            logError(`Failed to fetch data: ${response.statusText} (Status: ${response.status})`);
            return null;
        }

        // Log rate limit information
        const rateLimit = response.headers.get('X-RateLimit-Limit');
        const remaining = response.headers.get('X-RateLimit-Remaining');
        if (rateLimit && remaining) {
            logInfo(`Rate limit: ${remaining}/${rateLimit} requests remaining.`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        logError(`Error fetching data from API (${endpointKey}): ${error.message}`);
        return null;
    }
}

module.exports = { fetchFromApi };
