/**
 * Renders a text-based progress bar.
 * @param {number} progress - The current progress value.
 * @param {number} total - The total required for completion.
 * @param {Object} emojiMap - Mapping of custom emojis for the progress bar.
 * @param {number} [barLength=10] - The total length of the progress bar.
 * @returns {string} - The rendered progress bar.
 */
function renderCustomProgressBar(progress = 0, total = 1, emojiMap, barLength = 10) {
    // Ensure valid values
    progress = Math.max(progress, 0);
    total = Math.max(total, 1);

    const filledLength = Math.round((progress / total) * barLength);
    const emptyLength = barLength - filledLength;

    const filledBar = emojiMap.HelldiverProgress.repeat(filledLength);
    const emptyBar = emojiMap.IlluminateProgress.repeat(emptyLength);

    return `${filledBar}${emptyBar}`;
}

module.exports = { renderCustomProgressBar };
