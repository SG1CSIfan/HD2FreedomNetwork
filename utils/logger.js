const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Define log directory path
const logsDir = path.join(__dirname, '../logs');

// Create logger instance with daily rotation
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level.toUpperCase()}] ${message}`)
    ),
    transports: [
        new DailyRotateFile({
            filename: path.join(logsDir, 'majorOrder-%DATE%.log'), // Rotate log files daily
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d', // Keep logs for 14 days
            zippedArchive: true, // Optional: Compress old logs
        }),
        new DailyRotateFile({
            filename: path.join(logsDir, 'errors-%DATE%.log'), // Separate error log file
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            zippedArchive: true,
        }),
        new transports.Console(), // Log to console as well
    ],
});

// Custom log functions for convenience
function logInfo(message) {
    logger.info(message);
}

function logError(message) {
    logger.error(message);
}

module.exports = { logInfo, logError };
