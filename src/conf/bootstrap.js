import { initLogger } from './logging';
import { loadEvents } from '../events';
import Discord        from 'discord.js';

export async function initApplication() {
    try {
        // Load a local .env file if in development or test
        if (process.env.NODE_ENV !== 'production') {
            require('dotenv').config();
        }

        // Initialize the logger to use throughout the application
        await initLogger();

        // Create a Discord client
        let client = await new Discord.Client();

        // Register events with the client
        client = await loadEvents(client);

        // Get the bot's access token
        const BOT_TOKEN = process.env.BOT_TOKEN;

        // Tell the bot to log in
        await client.login(BOT_TOKEN)

    } catch (error) {
        // If any error is thrown during initialization, log the error to the console and exit
        console.error(`NOT LOGGED IN: '${error}'`);
        process.exit();
    }
}
