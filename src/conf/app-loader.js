import { loadDatabase } from '../database'
import { initLogger }   from './logging';
import { loadEvents }   from '../events';
import { config }       from '../conf/config';
import Discord          from 'discord.js';
import log              from 'winston';

/**
 * Initializes the application.
 *
 * @returns {Promise<void>} an empty Promise
 */
exports.initApplication = async () => {
    try {
        // Load a local .env file if in not in production
        if (process.env.NODE_ENV !== 'production') {
            require('dotenv').config();
        }

        // Initialize the logger to use throughout the application
        await initLogger();
        log.info('Successfully initialized the logging framework');

        // Loads the database with all of the tables defined in the database directory
        log.debug('Attempting to initialize the database...');
        await loadDatabase();
        // Test the connection to the database before initiating the Discord client
        await config.db.authenticate();
        log.info('Successfully initialized the database');

        // Create a Discord client and set it in mainContext
        config.client = await new Discord.Client();

        // Loads all of the events in the events directory
        // Note: This method uses the client, so it must be initialized first
        log.debug('Attempting to load available Discord events...');
        await loadEvents();
        log.info('Successfully loaded available Discord events');

        // Tell the bot to wake up
        log.debug('Attempting to connect the client to Discord...');
        await config.client.login(process.env.BOT_TOKEN);
        log.info('Successfully connected the client to Discord');

    } catch (err) {
        // If any error is thrown during initialization, log the error to the console and exit
        console.error(`NOT LOGGED IN: '${err}'`);
        process.exit();
    }
};