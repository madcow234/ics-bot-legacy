import { initLogger } from './logging';
import { loadEvents } from '../events';
import { setClient }  from '../templates/embed';
import Discord        from 'discord.js';

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

        // Create a Discord client
        let client = await new Discord.Client();

        // Set the client for new message embed templates
        // This is simply so we don't have to constantly pass the client when using them
        await setClient(client);

        // Register events with the client
        await loadEvents(client);

        // Get the bot's access token
        const BOT_TOKEN = process.env.BOT_TOKEN;

        // Tell the bot to wake up
        await client.login(BOT_TOKEN);

    } catch (err) {
        // If any error is thrown during initialization, log the error to the console and exit
        console.error(`NOT LOGGED IN: '${err}'`);
        process.exit();
    }
};
