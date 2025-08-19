const winston = require('winston');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

        if (stack) {
            log += `\n${stack}`;
        }

        if (Object.keys(meta).length > 0) {
            log += `\n${JSON.stringify(meta, null, 2)}`;
        }

        return log;
    })
);

// Create logger instance with error handling
let logger;
try {
    logger = winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: logFormat,
        defaultMeta: { service: 'av-master-backend' },
        transports: [
            // Write all logs with importance level of `error` or less to `error.log`
            new winston.transports.File({
                filename: 'logs/error.log',
                level: 'error',
                maxsize: 5242880, // 5MB
                maxFiles: 5
            }),

            // Write all logs with importance level of `info` or less to `combined.log`
            new winston.transports.File({
                filename: 'logs/combined.log',
                maxsize: 5242880, // 5MB
                maxFiles: 5
            }),
        ],
    });
} catch (error) {
    console.log('⚠️ Winston logger failed to initialize:', error.message);
    // Fallback to console logger
    logger = {
        info: console.log,
        error: console.error,
        warn: console.warn,
        debug: console.log
    };
}

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
    try {
        logger.add(new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }));
    } catch (error) {
        console.log('⚠️ Could not add console transport:', error.message);
    }
}

// Create logs directory if it doesn't exist
const fs = require('fs');
const path = require('path');

try {
    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
} catch (error) {
    console.log('⚠️ Could not create logs directory:', error.message);
}

module.exports = logger;
