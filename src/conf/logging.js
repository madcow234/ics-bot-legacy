import winston from 'winston';
import fs      from 'fs';

export function initLogger() {
    const nodeEnv = process.env.NODE_ENV;

    if (nodeEnv === 'production') {
        // Log to console in production because Heroku will add STDOUT to the log stream
        setConsoleLogger();

    } else if (nodeEnv === 'development' || nodeEnv === 'test') {

        try {
            // Attempt to create a /logs directory
            fs.mkdirSync('./logs');

        } catch (err) {
            // If the /logs directory already exists, continue
            // Otherwise, return a console logger
            if (err.code !== 'EEXIST') {
                console.log(`An error has occurred that cannot be fixed (code: ${err.code})!`);
                console.log(`Switching to console logging...`);
                setConsoleLogger();
            }
        }

        const filename = nodeEnv === 'test' ? 'ics-bot.test.log' : 'ics-bot.log';

        // As long as a /logs directory exists, return a file logger
        setFileLogger('logs', `${filename}`);

    } else {
        console.log(`Cannot determine current Node environment! You may need to set a "process.env.NODE_ENV" variable in your .env file.`);
        console.log(`Switching to console logging...`);
        setConsoleLogger();
    }
}

function setConsoleLogger() {
    winston.configure({
        transports: [
            new winston.transports.Console({
                name: 'console',
                colorize: true,
                timestamp: function () {
                    return new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
                }
            }),
        ]
    });
}

function setFileLogger(directoryName, filename) {
    winston.configure({
        transports: [
            new winston.transports.File({
                name: 'file',
                filename: `./${directoryName}/${filename}`,
                timestamp: function () {
                    return new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
                }
            })
        ]
    });
}
