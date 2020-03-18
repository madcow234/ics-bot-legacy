import winston from 'winston';
import fs      from 'fs';

const formatPattern = winston.format.printf(({ level, message, label, timestamp }) => {
    return `${timestamp} ${level.toUpperCase().padStart(5)}: ${message}`;
});

/**
 * Initializes the logging framework.
 *
 * @returns {Promise<void>} an empty Promise
 */
exports.initLogger = async () => {
    const NODE_ENV = process.env.NODE_ENV;
    const logDirName = 'logs';
    const filename = 'ics-bot-dev';

    // Log to console in production because Heroku will add STDOUT to the log stream
    if (NODE_ENV === 'production') {
        await setConsoleLogger();
        return;
    }

    // Attempt to create a /logs directory
    try {
        await fs.mkdirSync(`./${logDirName}`);

    } catch (err) {
        // If there was an error and the /logs directory does not exist, return the console logger
        if (err.code !== 'EEXIST') {
            console.log(`An error has occurred that cannot be fixed (code: ${err.code})!`);
            console.log(`Switching to console logging...`);
            await setConsoleLogger();
        }
    }

    if (NODE_ENV === 'test') {
        await setTestLogger(logDirName, `${filename}`);
        return;
    }

    if (NODE_ENV === 'development') {
        await setDevelopmentLogger(logDirName, `${filename}`);
        return;
    }

    // If we make it all the way down here, the environment is using a weird NODE_ENV variable that we can't recognize
    // In this case, we just log some messages to the console and set the console logger
    console.log(`Cannot determine current Node environment! You may need to set a "process.env.NODE_ENV" environment variable or create a .env file.`);
    console.log(`Switching to console logging...`);
    await setConsoleLogger();

};

const setConsoleLogger = async () => {
    // noinspection JSCheckFunctionSignatures
    winston.configure({
        transports: [
            new winston.transports.Console({
                name: 'console',
                colorize: true,
                format: winston.format.combine(
                    winston.format.splat(),
                    winston.format.simple(),
                    winston.format.timestamp(),
                    formatPattern
                )
            }),
        ]
    });
};

const setTestLogger = async (directoryName, filename) => {
    winston.configure({
        transports: [
            new winston.transports.File({
                name: 'file',
                filename: `./${directoryName}/${filename}.test.log`,
                format: winston.format.combine(
                    winston.format.splat(),
                    winston.format.simple(),
                    winston.format.timestamp(),
                    formatPattern
                )
            })
        ]
    });
};

const setDevelopmentLogger = async (directoryName, filename) => {
    winston.configure({
        transports: [
            new winston.transports.File({
                name: 'json',
                level: 'debug',
                filename: `./${directoryName}/${filename}.json.log`,
                format: winston.format.combine(
                    winston.format.json()
                )
            }),
            new winston.transports.File({
                name: 'standard',
                level: 'debug',
                filename: `./${directoryName}/${filename}.log`,
                format: winston.format.combine(
                    winston.format.splat(),
                    winston.format.simple(),
                    winston.format.timestamp(),
                    formatPattern
                )
            }),
            new winston.transports.File({
                name: 'stackTrace',
                level: 'error',
                filename: `./${directoryName}/${filename}.stackTrace.log`,
                format: winston.format.combine(
                    winston.format.splat(),
                    winston.format.simple(),
                    winston.format.timestamp(),
                    formatPattern
                )
            })
        ]
    });
};
